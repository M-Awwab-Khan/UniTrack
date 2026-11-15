import { format } from "node:util";
import { type Logger, SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
	BatchLogRecordProcessor,
	LoggerProvider,
	type LogRecordProcessor,
	type ReadWriteLogRecord,
} from "@opentelemetry/sdk-logs";
import { waitUntil } from "@vercel/functions";

type Method = "debug" | "log" | "info" | "warn" | "error";

const SEVERITY: Record<Method, [SeverityNumber, string]> = {
	debug: [SeverityNumber.DEBUG, "DEBUG"],
	log: [SeverityNumber.INFO, "INFO"],
	info: [SeverityNumber.INFO, "INFO"],
	warn: [SeverityNumber.WARN, "WARN"],
	error: [SeverityNumber.ERROR, "ERROR"],
};

/**
 * Batches records, but flushes soon after each burst and hands the flush to
 * Vercel's waitUntil, so a function that freezes right after its response
 * still delivers its logs. Outside Vercel, waitUntil is a no-op.
 */
class FlushingProcessor implements LogRecordProcessor {
	private dirty = false;
	private flushing: Promise<void> | undefined;

	constructor(private readonly inner: BatchLogRecordProcessor) {}

	onEmit(record: ReadWriteLogRecord): void {
		this.inner.onEmit(record);
		this.dirty = true;
		if (!this.flushing) {
			this.flushing = this.drain().finally(() => {
				this.flushing = undefined;
			});
			waitUntil(this.flushing);
		}
	}

	private async drain(): Promise<void> {
		while (this.dirty) {
			this.dirty = false;
			// Coalesce the records a request logs together into one export.
			await new Promise((resolve) => setTimeout(resolve, 25));
			await this.inner.forceFlush().catch(() => undefined);
		}
	}

	forceFlush(): Promise<void> {
		return this.inner.forceFlush();
	}

	shutdown(): Promise<void> {
		return this.inner.shutdown();
	}
}

let started = false;

export function startLogExport({ url, token }: { url: string; token: string }) {
	if (started) return;
	started = true;

	const exporter = new OTLPLogExporter({
		url,
		headers: { Authorization: `Bearer ${token}` },
	});
	const resource = resourceFromAttributes(
		Object.fromEntries(
			Object.entries({
				"service.name": process.env.OTEL_SERVICE_NAME ?? "unitrack-web",
				"deployment.environment.name":
					process.env.VERCEL_ENV ?? process.env.NODE_ENV,
				"vcs.ref.head.name": process.env.VERCEL_GIT_COMMIT_REF,
				"vcs.ref.head.revision": process.env.VERCEL_GIT_COMMIT_SHA,
				"cloud.provider": process.env.VERCEL ? "vercel" : undefined,
				"cloud.region": process.env.VERCEL_REGION,
			}).filter(([, value]) => value),
		),
	);
	const provider = new LoggerProvider({
		resource,
		processors: [
			new FlushingProcessor(
				new BatchLogRecordProcessor({ exporter, scheduledDelayMillis: 1000 }),
			),
		],
	});
	patchConsole(provider.getLogger("console"));
}

/** Mirror server console output into OpenTelemetry, keeping the original output. */
function patchConsole(logger: Logger) {
	let emitting = false;
	for (const method of Object.keys(SEVERITY) as Method[]) {
		const original = console[method].bind(console);
		console[method] = (...args: unknown[]) => {
			original(...args);
			if (emitting) return;
			emitting = true;
			try {
				const [severityNumber, severityText] = SEVERITY[method];
				const error = args.find((arg) => arg instanceof Error);
				logger.emit({
					severityNumber,
					severityText,
					body: format(...args),
					attributes: error
						? {
								"exception.type": error.name,
								"exception.message": error.message,
								"exception.stacktrace": error.stack ?? "",
							}
						: undefined,
				});
			} catch {
				// Logging must never break the request.
			} finally {
				emitting = false;
			}
		};
	}
}

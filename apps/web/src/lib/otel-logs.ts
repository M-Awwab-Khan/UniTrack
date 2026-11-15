import { readFileSync } from "node:fs";
import { SourceMap } from "node:module";
import { dirname, resolve } from "node:path";
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

const sourceMaps = new Map<string, SourceMap | null>();

function sourceMapFor(file: string): SourceMap | null {
	if (!sourceMaps.has(file)) {
		let map: SourceMap | null = null;
		try {
			map = new SourceMap(JSON.parse(readFileSync(`${file}.map`, "utf8")));
		} catch {
			// No map shipped for this chunk: leave its frames as they are.
		}
		sourceMaps.set(file, map);
	}
	return sourceMaps.get(file) ?? null;
}

// A bundled frame such as `.next/server/chunks/x._.js:363:49921`, relative or absolute.
const FRAME = /((?:\/|\.next\/)[^\s()'"]*?\.js):(\d+):(\d+)/g;

/**
 * Next.js replaces Error.prepareStackTrace with an unmapped formatter, so
 * Node's own source-map support never applies to error.stack. Map bundled
 * frames here instead, using the .map files that
 * scripts/trace-source-maps.mjs ships with each function, so Tangent receives
 * frames like `/var/task/packages/api/src/routers/announcements.ts:146:66`.
 */
export function mapStack(text: string): string {
	return text.replace(FRAME, (match, path: string, line: string, column: string) => {
		const file = resolve(process.cwd(), path);
		const entry = sourceMapFor(file)?.findEntry(Number(line) - 1, Number(column) - 1);
		if (!entry || !("originalSource" in entry) || !entry.originalSource) return match;
		const source = decodeURIComponent(entry.originalSource)
			.replace(/^file:\/\//, "")
			.replace(/^turbopack:\/\/\/\[project\]\//, "");
		const original = source.startsWith("/") ? source : resolve(dirname(file), source);
		return `${original}:${entry.originalLine + 1}:${entry.originalColumn + 1}`;
	});
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
				const body = mapStack(format(...args));
				const stack = error ? mapStack(error.stack ?? "") : "";
				const attributes: Record<string, string> = {};
				if (error) {
					attributes["exception.type"] = error.name;
					attributes["exception.message"] = error.message;
					attributes["exception.stacktrace"] = stack;
				}
				// Flags a deploy whose functions were packaged without their .map files.
				if (/\.next\/server\/[^\s()]*\.js:\d+/.test(body + stack)) {
					attributes["code.sourcemap"] = "missing";
				}
				logger.emit({ severityNumber, severityText, body, attributes });
			} catch {
				// Logging must never break the request.
			} finally {
				emitting = false;
			}
		};
	}
}

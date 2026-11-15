/**
 * Next.js instrumentation hook. It runs once per server instance at startup.
 *
 * When TANGENT_OTLP_LOGS_URL and TANGENT_INGEST_TOKEN are set, server-side
 * console output is shipped to Tangent over OTLP/HTTP JSON. Without them this
 * is a no-op, so local development is unaffected.
 */
export async function register() {
	// The OpenTelemetry Node SDK does not run on the Edge runtime.
	if (process.env.NEXT_RUNTIME !== "nodejs") return;
	const url = process.env.TANGENT_OTLP_LOGS_URL;
	const token = process.env.TANGENT_INGEST_TOKEN;
	if (!url || !token) return;
	const { startLogExport } = await import("./lib/otel-logs");
	startLogExport({ url, token });
}

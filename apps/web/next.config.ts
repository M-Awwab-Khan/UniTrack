import type { NextConfig } from "next";
import "@uni-track/config/env";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	// Emit server source maps. scripts/trace-source-maps.mjs then ships them with
	// each function, so production stack traces (and the logs sent to Tangent)
	// point at src/ files instead of .next chunks.
	experimental: { serverSourceMaps: true },
};

export default nextConfig;

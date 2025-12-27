import type { NextConfig } from "next";
import "@uni-track/config/env";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
};

export default nextConfig;

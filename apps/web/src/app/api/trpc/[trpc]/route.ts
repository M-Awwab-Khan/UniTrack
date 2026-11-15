import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { appRouter } from "@uni-track/api/root";
import { createTRPCContext } from "@uni-track/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */

const createContext = async (req: NextRequest) => {
	return createTRPCContext({
		headers: req.headers,
	});
};

const handler = (req: NextRequest) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req),
		// Always log, so production failures reach Tangent. Client errors
		// (bad input, unauthorized) are warnings; server faults are errors.
		onError: ({ path, error }) => {
			const where = `tRPC ${error.code} on ${path ?? "<no-path>"}`;
			if (error.code === "INTERNAL_SERVER_ERROR") {
				console.error(`❌ ${where}:`, error.cause ?? error);
			} else {
				console.warn(`⚠️ ${where}: ${error.message}`);
			}
		},
	});

export { handler as GET, handler as POST };


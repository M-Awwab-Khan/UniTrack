import { protectedProcedure, publicProcedure, router } from "../index";
import { authRouter } from "./auth";

import { dashboardRouter } from "./dashboard";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => "ok"),
	privateData: protectedProcedure.query(() => "Sensitive Data"),
	auth: authRouter,
	dashboard: dashboardRouter,
});
export type AppRouter = typeof appRouter;

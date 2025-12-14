import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@uni-track/api/routers/index";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
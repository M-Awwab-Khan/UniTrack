import { protectedProcedure, publicProcedure, router } from "../index";
import { authRouter } from "./auth";
import { dashboardRouter } from "./dashboard";
import { adminRouter } from "./admin";
import { assignmentsRouter } from "./assignments";
import { announcementsRouter } from "./announcements";
import { notesRouter } from "./notes";
import { coursesRouter } from "./courses";
import { taRouter } from "./ta";
import { timetableRouter } from "./timetable";
import { profileRouter } from "./profile";
import { settingsRouter } from "./settings";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => "ok"),
	privateData: protectedProcedure.query(() => "Sensitive Data"),
	auth: authRouter,
	dashboard: dashboardRouter,
	admin: adminRouter,
	assignments: assignmentsRouter,
	announcements: announcementsRouter,
	notes: notesRouter,
	courses: coursesRouter,
	ta: taRouter,
	timetable: timetableRouter,
	profile: profileRouter,
	settings: settingsRouter,
});
export type AppRouter = typeof appRouter;

import { publicProcedure, protectedProcedure, createTRPCRouter as router } from "./trpc";
import { authRouter } from "./routers/auth";
import { dashboardRouter } from "./routers/dashboard";
import { adminRouter } from "./routers/admin";
import { assignmentsRouter } from "./routers/assignments";
import { announcementsRouter } from "./routers/announcements";
import { notesRouter } from "./routers/notes";
import { coursesRouter } from "./routers/courses";
import { taRouter } from "./routers/ta";
import { timetableRouter } from "./routers/timetable";
import { profileRouter } from "./routers/profile";
import { settingsRouter } from "./routers/settings";
import { notificationsRouter } from "./routers/notifications";
import { studentDashboardRouter } from "./routers/student-dashboard";
import { adminDashboardRouter } from "./routers/admin-dashboard";
import { searchRouter } from "./routers/search";
import { createCallerFactory } from "./trpc";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => "ok"),
	privateData: protectedProcedure.query(() => "Sensitive Data"),
	auth: authRouter,
	dashboard: dashboardRouter,
	studentDashboard: studentDashboardRouter,
	adminDashboard: adminDashboardRouter,
	search: searchRouter,
	admin: adminRouter,
	assignments: assignmentsRouter,
	announcements: announcementsRouter,
	notes: notesRouter,
	courses: coursesRouter,
	ta: taRouter,
	timetable: timetableRouter,
	profile: profileRouter,
	settings: settingsRouter,
	notifications: notificationsRouter,
});
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
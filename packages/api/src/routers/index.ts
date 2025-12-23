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
import { notificationsRouter } from "./notifications";
import { studentDashboardRouter } from "./student-dashboard";
import { adminDashboardRouter } from "./admin-dashboard";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => "ok"),
	privateData: protectedProcedure.query(() => "Sensitive Data"),
	auth: authRouter,
	dashboard: dashboardRouter,
	studentDashboard: studentDashboardRouter,
	adminDashboard: adminDashboardRouter,
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

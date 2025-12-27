
import { createTRPCRouter as router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
    db,
} from "@uni-track/db";
import { courses, user, semesters } from "@uni-track/db/schema";

import { eq, count } from "drizzle-orm";

export const adminDashboardRouter = router({
    getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.session.user.role !== "admin") {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        // 1. Total Courses
        const [coursesCount] = await db.select({ value: count() }).from(courses);

        // 2. Total Students
        const [studentsCount] = await db.select({ value: count() }).from(user).where(eq(user.role, "student"));

        // 3. Total TAs
        const [tasCount] = await db.select({ value: count() }).from(user).where(eq(user.role, "ta"));

        // 4. Active Semester
        const activeSemesterData = await db.query.semesters.findFirst({
            where: eq(semesters.status, "active")
        });

        return {
            totalCourses: coursesCount?.value || 0,
            totalStudents: studentsCount?.value || 0,
            totalTAs: tasCount?.value || 0,
            activeSemester: activeSemesterData ? {
                name: activeSemesterData.name,
                startDate: activeSemesterData.startDate,
                isActive: true
            } : null
        };
    }),

    getRecentAdminActivity: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.session.user.role !== "admin") {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        // Recent System/Important Notifications
        const activity = await db.query.notifications.findMany({
            where: (t, { or, eq }) => or(
                eq(t.type, "system"),
                eq(t.type, "invite"), // "TA Invited" usually comes here or system
                eq(t.priority, "important")
            ),
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            limit: 5
        });

        return activity.map(item => ({
            id: item.id,
            title: item.title,
            message: item.message,
            createdAt: item.createdAt,
            type: item.type
        }));
    }),
});

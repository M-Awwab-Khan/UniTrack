
import { createTRPCRouter as router, protectedProcedure } from "../trpc";
import { db } from "@uni-track/db";
import {
    courseStudents,
    assignmentSubmissions,
} from "@uni-track/db/schema";
import { eq } from "drizzle-orm";

export const studentDashboardRouter = router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const { id: userId } = ctx.session.user;

        // 1. Enrolled Courses Count
        const enrolments = await db.query.courseStudents.findMany({
            where: eq(courseStudents.userId, userId),
        });
        const enrolledCourseIds = enrolments.map(e => e.courseId);
        const enrolledCount = enrolledCourseIds.length;

        if (enrolledCount === 0) {
            return {
                enrolledCourses: 0,
                upcomingDeadlines: 0,
                overdueTasks: 0,
                todaysClasses: 0
            };
        }

        // 2. Upcoming Deadlines (Next 7 days)
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        // Fetch assignments due soon for enrolled courses
        const upcomingAssignments = await db.query.assignments.findMany({
            where: (t, { inArray, and, between }) => and(
                inArray(t.courseId, enrolledCourseIds),
                between(t.dueDate, now, nextWeek)
            ),
            with: {
                submissions: {
                    where: eq(assignmentSubmissions.studentId, userId),
                    limit: 1
                }
            }
        });

        const upcomingCount = upcomingAssignments.filter(a => !a.submissions[0]).length;

        // 3. Overdue Tasks (Past due AND Not Submitted)
        const overdueAssignments = await db.query.assignments.findMany({
            where: (t, { inArray, and, lt }) => and(
                inArray(t.courseId, enrolledCourseIds),
                lt(t.dueDate, now)
            ),
            with: {
                submissions: {
                    where: eq(assignmentSubmissions.studentId, userId),
                    limit: 1
                }
            }
        });
        const overdueCount = overdueAssignments.filter(a => !a.submissions[0]).length;

        // 4. Today's Classes (Using Class Sessions)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Find classes for today where user is enrolled
        const todaysClasses = await db.query.classSessions.findMany({
            where: (t, { inArray, and, between, ne }) => and(
                inArray(t.courseId, enrolledCourseIds),
                between(t.date, startOfDay, endOfDay),
                ne(t.status, 'cancelled')
            )
        });

        return {
            enrolledCourses: enrolledCount,
            upcomingDeadlines: upcomingCount,
            overdueTasks: overdueCount,
            todaysClasses: todaysClasses.length
        };
    }),

    getUpcomingDeadlines: protectedProcedure.query(async ({ ctx }) => {
        const { id: userId } = ctx.session.user;
        const now = new Date();

        const enrolments = await db.query.courseStudents.findMany({
            where: eq(courseStudents.userId, userId),
        });
        const enrolledCourseIds = enrolments.map(e => e.courseId);

        if (enrolledCourseIds.length === 0) return [];

        const assignmentsData = await db.query.assignments.findMany({
            where: (t, { inArray }) => inArray(t.courseId, enrolledCourseIds),
            with: {
                course: true,
                submissions: {
                    where: eq(assignmentSubmissions.studentId, userId),
                    limit: 1
                }
            },
            orderBy: (assignments, { asc }) => [asc(assignments.dueDate)],
        });

        const results = assignmentsData.map(a => {
            const sub = a.submissions[0];
            const isSubmitted = !!sub;
            const isDueToday = new Date(a.dueDate).toDateString() === now.toDateString();
            const isOverdue = new Date(a.dueDate) < now && !isDueToday;

            if (isSubmitted && !sub?.isLate) return null;

            let status: 'Due Today' | 'Upcoming' | 'Overdue' = 'Upcoming';
            if (isDueToday) status = 'Due Today';
            else if (isOverdue) status = 'Overdue';

            return {
                id: a.id,
                title: a.title,
                courseName: a.course.name,
                dueDate: a.dueDate,
                status // 'Due Today' | 'Upcoming' | 'Overdue'
            };
        })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            })
            .slice(0, 5);

        return results;
    }),

    getTodaysClasses: protectedProcedure.query(async ({ ctx }) => {
        const { id: userId } = ctx.session.user;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const enrolments = await db.query.courseStudents.findMany({
            where: eq(courseStudents.userId, userId),
        });
        const enrolledCourseIds = enrolments.map(e => e.courseId);

        if (enrolledCourseIds.length === 0) return [];

        // Query classSessions directly
        const classes = await db.query.classSessions.findMany({
            where: (t, { inArray, and, between }) => and(
                inArray(t.courseId, enrolledCourseIds),
                between(t.date, startOfDay, endOfDay)
            ),
            with: {
                course: true
            },
            orderBy: (t, { asc }) => [asc(t.startTime)]
        });

        return classes.map(s => ({
            id: s.id,
            courseName: s.course.name,
            startTime: s.startTime,
            endTime: s.endTime,
            location: s.location,
            type: s.type, // 'regular' | 'extra' | 'compensatory'
            status: s.status === 'cancelled' ? 'Cancelled' : 'Scheduled' // Map enum to UI string
        }));
    }),

    getRecentAnnouncements: protectedProcedure.query(async ({ ctx }) => {
        const { id: userId } = ctx.session.user;

        const enrolments = await db.query.courseStudents.findMany({
            where: eq(courseStudents.userId, userId),
        });
        const enrolledCourseIds = enrolments.map(e => e.courseId);

        if (enrolledCourseIds.length === 0) return [];

        const items = await db.query.announcements.findMany({
            where: (t, { inArray }) => inArray(t.courseId, enrolledCourseIds),
            with: {
                course: true
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            limit: 3
        });

        return items.map(i => ({
            id: i.id,
            title: i.title,
            courseName: i.course.name,
            createdAt: i.createdAt
        }));
    }),

    getMyCourses: protectedProcedure.query(async ({ ctx }) => {
        const { id: userId } = ctx.session.user;

        const items = await db.query.courseStudents.findMany({
            where: eq(courseStudents.userId, userId),
            with: {
                course: {
                    with: {
                        assignments: {
                            with: {
                                submissions: {
                                    where: eq(assignmentSubmissions.studentId, userId)
                                }
                            }
                        },
                    }
                }
            }
        });


        return items.map(item => {
            const c = item.course;
            const totalTasks = c.assignments.length;
            const submittedCount = c.assignments.filter(a => a.submissions.length > 0).length;
            const pendingTasks = totalTasks - submittedCount;
            const progress = totalTasks > 0 ? Math.round((submittedCount / totalTasks) * 100) : 0;

            return {
                id: c.id,
                code: c.code,
                name: c.name,
                instructor: c.instructor || "Unknown",
                pendingTasks,
                progress
            };
        });
    })
});

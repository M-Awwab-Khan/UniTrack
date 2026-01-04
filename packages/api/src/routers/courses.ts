import { createTRPCRouter as router, protectedProcedure } from "../trpc";
import { db } from "@uni-track/db";
import { courseEnrollmentCodes, courseStudents } from "@uni-track/db/schema";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createNotification } from "../lib/notifications";

export const coursesRouter = router({

    // Get all courses (for dropdown)
    getCourses: protectedProcedure.query(async () => {
        return db.query.courses.findMany({
            orderBy: (courses, { asc }) => [asc(courses.code)],
        });
    }),

    // Get All Courses (Paginated)
    getAllCourses: protectedProcedure
        .input(
            z.object({
                page: z.number().min(1).default(1),
                limit: z.number().min(1).max(100).default(10),
                search: z.string().optional(),
            })
        )
        .query(async ({ input }) => {
            const offset = (input.page - 1) * input.limit;

            const whereClause = input.search
                ? (cols: any, { or, ilike }: any) =>
                    or(
                        ilike(cols.code, `%${input.search}%`),
                        ilike(cols.name, `%${input.search}%`)
                    )
                : undefined;

            const items = await db.query.courses.findMany({
                where: whereClause,
                limit: input.limit,
                offset: offset,
                orderBy: (courses, { desc }) => [desc(courses.createdAt)],
            });

            return items;
        }),

    // Get Course By ID (Public/Protected)
    getById: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input }) => {
            const course = await db.query.courses.findFirst({
                where: (c, { eq }) => eq(c.id, input.id),
                with: {
                    assignments: true, // Needed for simple checks or we rely on getStats for counts
                }
            });

            if (!course) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Course not found",
                });
            }

            return {
                id: course.id,
                name: course.name,
                code: course.code,
                description: course.description,
                credits: course.creditHours,
                semester: course.semester,
                department: course.department,
                instructor: course.instructor || "Unknown Instructor",
                imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80", // Placeholder
                color: "bg-blue-500", // Placeholder
                startDate: course.createdAt.toISOString(), // Placeholder
                endDate: new Date(course.createdAt.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(), // Placeholder approx 4 months
            };
        }),

    // Get Course Stats
    getStats: protectedProcedure
        .input(z.object({ courseId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // 1. Total Assignments
            const allAssignments = await db.query.assignments.findMany({
                where: (a, { eq }) => eq(a.courseId, input.courseId),
            });
            const totalAssignments = allAssignments.length;

            // 2. Pending Assignments (for user)
            // Get submissions
            const mySubmissions = await db.query.assignmentSubmissions.findMany({
                where: (sub, { eq, and, inArray }) => and(
                    eq(sub.studentId, userId),
                    inArray(sub.assignmentId, allAssignments.map(a => a.id))
                )
            });

            const submittedIds = new Set(mySubmissions.map(s => s.assignmentId));
            const pendingAssignments = allAssignments.filter(a => !submittedIds.has(a.id) && new Date(a.dueDate) > new Date()).length;

            // 3. Upcoming Classes (next 7 days)
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);

            // Fetch sessions
            const sessions = await db.query.classSessions.findMany({
                where: (cs, { eq, and, gte, lte }) => and(
                    eq(cs.courseId, input.courseId),
                    gte(cs.date, today),
                    lte(cs.date, nextWeek)
                )
            });

            // Note: If no sessions generated, might be 0. We rely on timetable router for generation.
            // For stats, we just read what exists.

            return {
                totalAssignments,
                pendingAssignments,
                upcomingClasses: sessions.length,
                lastUpdated: new Date().toISOString(), // Mock or use course updatedAt
            };
        }),

    // Validate Code & Get Course Info (Public/Protected)
    getEnrollInfoByCode: protectedProcedure
        .input(z.object({ code: z.string() }))
        .query(async ({ input }) => {
            const codeRecord = await db.query.courseEnrollmentCodes.findFirst({
                where: (c, { eq, and }) => and(eq(c.code, input.code), eq(c.isActive, true)),
                with: {
                    course: {
                        columns: {
                            name: true,
                            code: true,
                            department: true,
                            semester: true,
                        }
                    }
                }
            });

            if (!codeRecord) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Invalid or inactive enrollment code",
                });
            }

            // Check expiry
            if (codeRecord.expiresAt && codeRecord.expiresAt < new Date()) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Enrollment code has expired",
                });
            }

            // Check usage limit
            if (codeRecord.maxUses && codeRecord.uses >= codeRecord.maxUses) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Enrollment code usage limit reached",
                });
            }

            return {
                valid: true,
                courseName: codeRecord.course.name,
                courseCode: codeRecord.course.code,
                department: codeRecord.course.department,
                semester: codeRecord.course.semester,
            };
        }),

    // Enroll with Code
    enrollWithCode: protectedProcedure
        .input(z.object({ code: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            // const userRole = ctx.session.user.role;

            // if (userRole !== "student") {
            //     throw new TRPCError({
            //         code: "FORBIDDEN",
            //         message: "Only students can enroll in courses",
            //     });
            // }

            // 1. Validate Code again
            const codeRecord = await db.query.courseEnrollmentCodes.findFirst({
                where: (c, { eq, and }) => and(eq(c.code, input.code), eq(c.isActive, true)),
                with: {
                    course: true
                }
            });

            if (!codeRecord) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Invalid or inactive enrollment code",
                });
            }

            if (codeRecord.expiresAt && codeRecord.expiresAt < new Date()) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Enrollment code has expired",
                });
            }

            if (codeRecord.maxUses && codeRecord.uses >= codeRecord.maxUses) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Enrollment code usage limit reached",
                });
            }

            // 2. Check if already enrolled
            const existingEnrollment = await db.query.courseStudents.findFirst({
                where: (cs, { eq, and }) => and(eq(cs.courseId, codeRecord.courseId), eq(cs.userId, userId)),
            });

            if (existingEnrollment) {
                if (existingEnrollment.status === 'active') {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "You are already enrolled in this course",
                    });
                } else {
                    // Re-activate if dropped? For now, simpler to just say conflict or update.
                    // Let's update status to active
                    await db.update(courseStudents)
                        .set({ status: 'active', enrolledAt: new Date() })
                        .where(eq(courseStudents.id, existingEnrollment.id));

                    return { success: true, message: "Enrollment reactivated" };
                }
            }

            // 3. Enroll
            await db.transaction(async (tx) => {
                // Insert enrollment
                await tx.insert(courseStudents).values({
                    courseId: codeRecord.courseId,
                    userId: userId, // Assuming schema uses userId not studentId as per my override
                    status: 'active',
                });

                // Increment uses
                await tx.update(courseEnrollmentCodes)
                    .set({ uses: sql`${courseEnrollmentCodes.uses} + 1` })
                    .where(eq(courseEnrollmentCodes.id, codeRecord.id));
            });

            // 4. Notification
            await createNotification({
                userId: [userId],
                title: `Enrolled in ${codeRecord.course.name}`,
                message: `You have successfully enrolled in ${codeRecord.course.code} - ${codeRecord.course.name}.`,
                type: "system",
                entityType: "course",
                entityId: codeRecord.courseId,
            });

            return { success: true, courseId: codeRecord.courseId };
        }),

    // Get My Courses (Joined)
    getMyCourses: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            const enrollments = await db.query.courseStudents.findMany({
                where: (cs, { eq, and }) => and(eq(cs.userId, userId), eq(cs.status, 'active')),
                with: {
                    course: {
                        with: {
                            assignments: {
                                where: (a, { gt }) => gt(a.dueDate, new Date()),
                                limit: 5,
                                orderBy: (a, { desc }) => [desc(a.dueDate)]
                            },
                        }
                    }
                },
                orderBy: (cs, { desc }) => [desc(cs.enrolledAt)],
            });

            return enrollments.map(e => ({
                enrollmentId: e.id,
                courseId: e.course.id,
                code: e.course.code,
                name: e.course.name,
                semester: e.course.semester,
                department: e.course.department,
                activeAssignments: e.course.assignments.length,
                nextAssignment: e.course.assignments[0] ? {
                    title: e.course.assignments[0].title,
                    dueDate: e.course.assignments[0].dueDate
                } : null,
                enrolledAt: e.enrolledAt,
            }));
        }),
});
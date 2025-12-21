import { router, protectedProcedure } from "../index";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, classSessions, courseStudents } from "@uni-track/db";
import { eq } from "drizzle-orm";
import { createNotification } from "../lib/notifications";

// TA middleware - ensures user is a TA
const taProcedure = protectedProcedure.use(({ ctx, next }) => {
    if (ctx.session.user.role !== "ta") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "TA access required",
        });
    }
    return next({ ctx });
});

export const taRouter = router({
    // Add Extra Class
    addExtraClass: taProcedure
        .input(
            z.object({
                courseId: z.string().uuid(),
                date: z.coerce.date(),
                startTime: z.string(), // HH:MM:SS
                endTime: z.string(),
                location: z.string(),
                reason: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Find Active Semester for this date
            const semester = await db.query.semesters.findFirst({
                where: (sem, { and, lte, gte, or, isNull }) => and(
                    lte(sem.startDate, input.date),
                    or(isNull(sem.endDate), gte(sem.endDate, input.date))
                )
            });

            if (!semester) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No active semester found for this date",
                });
            }

            const [newClass] = await db
                .insert(classSessions)
                .values({
                    ...input,
                    semesterId: semester.id,
                    type: "extra",
                    status: "scheduled",
                    note: input.reason,
                    createdByUserId: ctx.session.user.id,
                })
                .returning();

            // Notify Students
            const students = await db.query.courseStudents.findMany({
                where: eq(courseStudents.courseId, input.courseId),
            });

            await createNotification({
                userId: students.map((student) => student.userId),
                title: "Extra Class Added",
                message: `Extra class has been added for ${input.courseId}`,
                type: "timetable",
                entityType: "timetable",
                entityId: newClass?.id,
            });
            return newClass;
        }),

    // Update Class Session (Cancel / Reschedule)
    updateClassSession: taProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
                action: z.enum(["cancel", "reschedule"]),
                reason: z.string().optional(), // For cancellation
                newDate: z.coerce.date().optional(), // For reschedule
                newStartTime: z.string().optional(),
                newEndTime: z.string().optional(),
                location: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { sessionId, action } = input;

            if (action === "cancel") {
                const [updated] = await db
                    .update(classSessions)
                    .set({
                        status: "cancelled",
                        cancelReason: input.reason,
                        updatedAt: new Date(),
                    })
                    .where(eq(classSessions.id, sessionId))
                    .returning();

                // Notify Students
                const students = await db.query.courseStudents.findMany({
                    where: eq(courseStudents.courseId, updated?.courseId as string),
                });

                await createNotification({
                    userId: students.map((student) => student.userId),
                    title: "Class Cancelled",
                    message: `Class has been cancelled for ${updated?.courseId}`,
                    type: "timetable",
                    entityType: "timetable",
                    entityId: updated?.id,
                });
                return updated;
            } else if (action === "reschedule") {
                if (!input.newDate || !input.newStartTime || !input.newEndTime) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Missing reschedule details" });
                }
                const [updated] = await db
                    .update(classSessions)
                    .set({
                        date: input.newDate,
                        startTime: input.newStartTime,
                        endTime: input.newEndTime,
                        location: input.location, // Optional update
                        status: "scheduled", // Reset status if it was cancelled? Usually yes.
                        updatedAt: new Date(),
                    })
                    .where(eq(classSessions.id, sessionId))
                    .returning();

                // Notify Students
                const students = await db.query.courseStudents.findMany({
                    where: eq(courseStudents.courseId, updated?.courseId as string),
                });

                await createNotification({
                    userId: students.map((student) => student.userId),
                    title: "Class Rescheduled",
                    message: `Class has been rescheduled for ${updated?.courseId}`,
                    type: "timetable",
                    entityType: "timetable",
                    entityId: updated?.id,
                });
                return updated;
            }
        }),
});

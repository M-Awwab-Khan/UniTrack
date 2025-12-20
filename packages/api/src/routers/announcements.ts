import { router, protectedProcedure } from "../index";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, announcements, priorityEnum } from "@uni-track/db";
import { eq } from "drizzle-orm";

// Helper to check if TA is assigned to the course
const isTaAssignedToCourse = async (userId: string, courseId: string) => {
    const assignment = await db.query.courseTas.findFirst({
        where: (ct, { eq, and }) => and(eq(ct.taId, userId), eq(ct.courseId, courseId)),
    });
    return !!assignment;
};

// TA Procedure
const taProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    if (ctx.session.user.role !== "ta") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only Teaching Assistants can perform this action",
        });
    }
    return next({ ctx });
});

export const announcementsRouter = router({
    // Get All Announcements
    getAll: protectedProcedure.query(async () => {
        const items = await db.query.announcements.findMany({
            with: {
                course: true,
                author: {
                    columns: {
                        name: true,
                        role: true, // Needed for mocked role display if needed, though usually we trust DB role
                    }
                }
            },
            orderBy: (announcements, { desc }) => [desc(announcements.createdAt)],
        });

        return items.map(item => ({
            id: item.id,
            title: item.title,
            content: item.content,
            courseName: item.course.name,
            courseCode: item.course.code,
            courseColor: "bg-blue-500", // placeholder
            author: item.author?.name || "Unknown",
            role: "TA", // Mocking role display, or could fetch from author.role
            date: item.createdAt.toISOString(),
            priority: item.priority,
            tags: [], // Schema doesn't have tags yet, mocking empty
            attachments: [], // Schema doesn't have attachments yet
            courseId: item.courseId, // Permission check needed
        }));
    }),

    // Create Announcement
    create: taProcedure
        .input(
            z.object({
                title: z.string().min(1),
                content: z.string().min(1),
                courseId: z.string().uuid(),
                priority: z.enum(priorityEnum.enumValues),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, input.courseId);
            if (!isAssigned) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not assigned to this course",
                });
            }

            await db.insert(announcements).values({
                title: input.title,
                content: input.content,
                courseId: input.courseId,
                priority: input.priority,
                createdBy: ctx.session.user.id,
            });

            return { success: true };
        }),

    // Update Announcement
    update: taProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                title: z.string().min(1),
                content: z.string().min(1),
                priority: z.enum(priorityEnum.enumValues),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const existing = await db.query.announcements.findFirst({
                where: eq(announcements.id, input.id),
            });

            if (!existing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Announcement not found" });
            }

            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, existing.courseId);
            if (!isAssigned) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not authorized to edit this announcement",
                });
            }

            await db.update(announcements)
                .set({
                    title: input.title,
                    content: input.content,
                    priority: input.priority,
                })
                .where(eq(announcements.id, input.id));

            return { success: true };
        }),

    // Delete Announcement
    delete: taProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const existing = await db.query.announcements.findFirst({
                where: eq(announcements.id, input.id),
            });

            if (!existing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Announcement not found" });
            }

            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, existing.courseId);
            if (!isAssigned) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not authorized to delete this announcement",
                });
            }

            await db.delete(announcements).where(eq(announcements.id, input.id));
            return { success: true };
        }),
});

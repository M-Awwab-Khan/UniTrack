import { router, protectedProcedure } from "../index";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, notes, noteTypeEnum } from "@uni-track/db";
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

export const notesRouter = router({
    // Get All Notes
    getAll: protectedProcedure.query(async () => {
        const items = await db.query.notes.findMany({
            with: {
                course: true,
                author: {
                    columns: {
                        name: true,
                    }
                }
            },
            orderBy: (notes, { desc }) => [desc(notes.createdAt)],
        });

        return items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            courseName: item.course.name,
            courseCode: item.course.code,
            courseColor: "bg-blue-500", // placeholder
            uploadedBy: item.author?.name || "Unknown",
            uploadDate: item.createdAt.toISOString(),
            type: item.type,
            fileSize: "N/A", // Not storing file size yet
            url: item.fileUrl,
            week: item.week,
            courseId: item.courseId, // For permissions
        }));
    }),

    // Create Note
    create: taProcedure
        .input(
            z.object({
                title: z.string().min(1),
                description: z.string().optional(),
                courseId: z.string().uuid(),
                type: z.enum(noteTypeEnum.enumValues),
                fileUrl: z.string().url(),
                week: z.string().optional(),
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

            await db.insert(notes).values({
                title: input.title,
                description: input.description,
                courseId: input.courseId,
                type: input.type,
                fileUrl: input.fileUrl,
                week: input.week,
                createdBy: ctx.session.user.id,
            });

            return { success: true };
        }),

    // Update Note
    update: taProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                title: z.string().min(1),
                description: z.string().optional(),
                type: z.enum(noteTypeEnum.enumValues),
                fileUrl: z.string().url(),
                week: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const existing = await db.query.notes.findFirst({
                where: eq(notes.id, input.id),
            });

            if (!existing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
            }

            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, existing.courseId);
            if (!isAssigned) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not authorized to edit this note",
                });
            }

            await db.update(notes)
                .set({
                    title: input.title,
                    description: input.description,
                    type: input.type,
                    fileUrl: input.fileUrl,
                    week: input.week,
                })
                .where(eq(notes.id, input.id));

            return { success: true };
        }),

    // Delete Note
    delete: taProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const existing = await db.query.notes.findFirst({
                where: eq(notes.id, input.id),
            });

            if (!existing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
            }

            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, existing.courseId);
            if (!isAssigned) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not authorized to delete this note",
                });
            }

            await db.delete(notes).where(eq(notes.id, input.id));
            return { success: true };
        }),
});

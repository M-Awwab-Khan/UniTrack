import { createTRPCRouter as router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@uni-track/db";
import { courseStudents, notes, noteTypeEnum, attachments, attachmentTypeEnum } from "@uni-track/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "../lib/notifications";
import { storage } from "@uni-track/storage"; // Assume storage is available

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
                },
                attachments: true,
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
            attachments: item.attachments.map(att => ({
                id: att.id,
                type: att.type,
                name: att.name,
                url: att.url,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
            })),
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
                week: z.string().optional(),
                attachments: z.array(z.object({
                    type: z.enum(attachmentTypeEnum.enumValues),
                    name: z.string().min(1),
                    value: z.string().min(1), // Base64 or URL
                    fileSize: z.number().optional(),
                    mimeType: z.string().optional(),
                })).optional(),
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

            const [newNote] = await db.insert(notes).values({
                title: input.title,
                description: input.description,
                courseId: input.courseId,
                type: input.type,
                week: input.week,
                createdBy: ctx.session.user.id,
            }).returning();

            // Handle Attachments
            if (input.attachments && input.attachments.length > 0) {
                for (const att of input.attachments) {
                    let url = att.value;
                    let publicId: string | null = null;

                    if (att.type === 'file') {
                        try {
                            const result = await storage.upload(att.value, {
                                folder: `notes/${newNote?.id}`,
                                resourceType: 'auto',
                            });
                            url = result.url;
                            publicId = result.publicId;
                        } catch (error) {
                            console.error("Upload failed for attachment", att.name, error);
                            continue;
                        }
                    }

                    await db.insert(attachments).values({
                        noteId: newNote?.id,
                        type: att.type,
                        name: att.name,
                        url: url,
                        publicId: publicId,
                        fileSize: att.fileSize,
                        mimeType: att.mimeType,
                    });
                }
            }

            // Notify Students
            const students = await db.query.courseStudents.findMany({
                where: eq(courseStudents.courseId, input.courseId),
            });

            await createNotification({
                userId: students.map((student) => student.userId),
                title: "Note Added",
                message: `Note has been added for ${input.courseId}`,
                type: "note",
                entityType: "note",
                entityId: newNote?.id,
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

    // Add Attachment (TA only)
    addAttachment: taProcedure
        .input(z.object({
            noteId: z.string().uuid(),
            type: z.enum(attachmentTypeEnum.enumValues),
            name: z.string().min(1),
            value: z.string().min(1),
            fileSize: z.number().optional(),
            mimeType: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const note = await db.query.notes.findFirst({
                where: eq(notes.id, input.noteId),
            });

            if (!note) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
            }

            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, note.courseId);
            if (!isAssigned) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized for this course" });
            }

            // Check max attachments
            const existingAttachments = await db.query.attachments.findMany({
                where: eq(attachments.noteId, input.noteId),
            });

            if (existingAttachments.length >= 10) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Maximum 10 attachments per note" });
            }

            let url = input.value;
            let publicId: string | null = null;

            if (input.type === 'file') {
                try {
                    const result = await storage.upload(input.value, {
                        folder: `notes/${input.noteId}`,
                        resourceType: 'auto',
                    });
                    url = result.url;
                    publicId = result.publicId;
                } catch (error) {
                    console.error("Upload failed", error);
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "File upload failed" });
                }
            }

            await db.insert(attachments).values({
                noteId: input.noteId,
                type: input.type,
                name: input.name,
                url: url,
                publicId: publicId,
                fileSize: input.fileSize,
                mimeType: input.mimeType,
            });

            return { success: true };
        }),

    // Remove Attachment (TA only)
    removeAttachment: taProcedure
        .input(z.object({
            attachmentId: z.string().uuid(),
        }))
        .mutation(async ({ ctx, input }) => {
            const attachment = await db.query.attachments.findFirst({
                where: eq(attachments.id, input.attachmentId),
                with: {
                    note: true,
                }
            });

            if (!attachment) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Attachment not found" });
            }

            if (!attachment.note) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid note attachment" });
            }

            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, attachment.note.courseId);
            if (!isAssigned) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
            }

            if (attachment.type === 'file' && attachment.publicId) {
                try {
                    await storage.delete(attachment.publicId);
                } catch (error) {
                    console.error("Cloudinary delete failed", error);
                }
            }

            await db.delete(attachments).where(eq(attachments.id, input.attachmentId));

            return { success: true };
        }),
});

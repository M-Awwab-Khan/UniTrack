import { createTRPCRouter as router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@uni-track/db";
import { announcements, priorityEnum, courseStudents, attachments, attachmentTypeEnum } from "@uni-track/db/schema";
import { storage } from "@uni-track/storage";
import { eq } from "drizzle-orm";
import { createNotification } from "../lib/notifications";

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
                },
                attachments: true,
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
            attachments: item.attachments.map(att => ({
                id: att.id,
                type: att.type,
                name: att.name,
                url: att.url,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
            })),
            courseId: item.courseId, // Permission check needed
        }));
    }),

    // Get Announcements by Course ID
    getByCourseId: protectedProcedure
        .input(z.object({ courseId: z.string().uuid() }))
        .query(async ({ input }) => {
            const items = await db.query.announcements.findMany({
                where: (a, { eq }) => eq(a.courseId, input.courseId),
                with: {
                    course: true,
                    author: {
                        columns: {
                            name: true,
                            role: true,
                        }
                    },
                    attachments: true,
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
                role: "Instructor", // Mock or derive
                date: item.createdAt.toISOString(),
                priority: item.priority,
                isImportant: item.priority === 'Important', // Map priority to isImportant boolean for UI
                tags: [],
                attachments: item.attachments.map(att => ({
                    id: att.id,
                    type: att.type,
                    name: att.name,
                    url: att.url,
                    fileSize: att.fileSize,
                    mimeType: att.mimeType,
                })),
                courseId: item.courseId,
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
                attachments: z.array(z.object({
                    type: z.enum(attachmentTypeEnum.enumValues),
                    name: z.string().min(1),
                    value: z.string().min(1),
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

            const [announcement] = await db.insert(announcements).values({
                title: input.title,
                content: input.content,
                courseId: input.courseId,
                priority: input.priority,
                createdBy: ctx.session.user.id,
            }).returning();

            if (!announcement) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Announcement could not be created",
                });
            }

            // Handle Attachments
            if (input.attachments && input.attachments.length > 0) {
                for (const att of input.attachments) {
                    let url = att.value;
                    let publicId: string | null = null;

                    if (att.type === 'file') {
                        try {
                            const result = await storage.upload(att.value, {
                                folder: `announcements/${announcement.id}`,
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
                        announcementId: announcement.id,
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
                title: "Announcement Created",
                message: `Announcement ${input.title} has been created`,
                type: "announcement",
                entityType: "announcement",
                entityId: announcement.id,
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

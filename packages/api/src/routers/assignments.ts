import { router, protectedProcedure } from "../index";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, assignments, assignmentTypeEnum, courseStudents } from "@uni-track/db";
import { eq } from "drizzle-orm";
import { createNotification } from "../lib/notifications";

// Helper to check if TA is assigned to the course
const isTaAssignedToCourse = async (userId: string, courseId: string) => {
    const assignment = await db.query.courseTas.findFirst({
        where: (ct, { eq, and }) => and(eq(ct.taId, userId), eq(ct.courseId, courseId)),
    });
    return !!assignment;
};

// Helper to notify (Simulating broadcast to students by notifying creator for demo)
const notifyNewAssignment = async (title: string, courseId: string, entityId: string) => {
    const students = await db.query.courseStudents.findMany({
        where: eq(courseStudents.courseId, courseId),
    });
    await createNotification({
        userId: students.map((student) => student.userId),
        title: `New Assignment: ${title}`,
        message: `An assignment has been created. (This would normally notify all students in course ${courseId})`,
        type: "assignment",
        entityType: "assignment",
        entityId,
        priority: "normal"
    });
};

// TA Procedure: Checks role and course assignment
const taProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    if (ctx.session.user.role !== "ta") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only Teaching Assistants can perform this action",
        });
    }
    return next({ ctx });
});

export const assignmentsRouter = router({
    // Get All Assignments (Accessible by Students and TAs)
    getAll: protectedProcedure.query(async () => {
        const items = await db.query.assignments.findMany({
            with: {
                course: true,
                author: {
                    columns: {
                        name: true,
                    }
                }
            },
            orderBy: (assignments, { asc }) => [asc(assignments.dueDate)],
        });

        // Map to UI shape roughly matching GlobalAssignment but with real data
        return items.map(item => ({
            id: item.id,
            title: item.title,
            courseName: item.course.name,
            courseCode: item.course.code,
            // Mocking color for now or could add to course schema
            courseColor: "bg-blue-500",
            type: item.type,
            dueDate: item.dueDate.toISOString(),
            status: new Date(item.dueDate) < new Date() ? 'Overdue' : 'Upcoming', // simplified status logic
            description: item.description,
            assignedBy: item.author?.name || "Unknown",
            submissionStatus: 'Not Submitted', // This would need a separate submissions table/logic
            instructions: item.instructions,
            courseId: item.courseId, // Needed for permission check
        }));
    }),

    // Create Assignment (TA only)
    create: taProcedure
        .input(
            z.object({
                title: z.string().min(1),
                description: z.string().min(1),
                courseId: z.string().uuid(),
                type: z.enum(assignmentTypeEnum.enumValues),
                dueDate: z.string().datetime(), // Expect ISO string
                instructions: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if TA is assigned to this course
            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, input.courseId);
            if (!isAssigned) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not assigned to this course",
                });
            }

            const [newAssignment] = await db.insert(assignments).values({
                title: input.title,
                description: input.description,
                courseId: input.courseId,
                type: input.type,
                dueDate: new Date(input.dueDate),
                instructions: input.instructions,
                createdBy: ctx.session.user.id,
            }).returning();

            // Trigger Notification (Notify Creator for Demo)
            if (newAssignment) {
                await notifyNewAssignment(input.title, input.courseId, newAssignment.id);
            }

            return { success: true };
        }),

    // Update Assignment (TA only)
    update: taProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                title: z.string().min(1),
                description: z.string().min(1),
                type: z.enum(assignmentTypeEnum.enumValues),
                dueDate: z.string().datetime(),
                instructions: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Get assignment to find courseId
            const existing = await db.query.assignments.findFirst({
                where: eq(assignments.id, input.id),
            });

            if (!existing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });
            }

            // Check permission
            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, existing.courseId);
            if (!isAssigned) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not authorized to edit this assignment",
                });
            }

            await db.update(assignments)
                .set({
                    title: input.title,
                    description: input.description,
                    type: input.type,
                    dueDate: new Date(input.dueDate),
                    instructions: input.instructions,
                })
                .where(eq(assignments.id, input.id));

            // Notify Update
            // TODO: Notify students

            const students = await db.query.courseStudents.findMany({
                where: eq(courseStudents.courseId, existing.courseId),
            });

            await createNotification({
                userId: students.map((student) => student.userId),
                title: "Assignment Updated",
                message: `Assignment ${input.title} has been updated`,
                type: "assignment",
                entityType: "assignment",
                entityId: input.id,
            });

            return { success: true };
        }),

    // Delete Assignment (TA only)
    delete: taProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            // Get assignment to find courseId
            const existing = await db.query.assignments.findFirst({
                where: eq(assignments.id, input.id),
            });

            if (!existing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });
            }

            // Check permission
            const isAssigned = await isTaAssignedToCourse(ctx.session.user.id, existing.courseId);
            if (!isAssigned) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not authorized to delete this assignment",
                });
            }

            await db.delete(assignments).where(eq(assignments.id, input.id));


            // Notify Students
            const students = await db.query.courseStudents.findMany({
                where: eq(courseStudents.courseId, existing.courseId),
            });

            await createNotification({
                userId: students.map((student) => student.userId),
                title: "Assignment Deleted",
                message: `Assignment ${existing.title} has been deleted`,
                type: "assignment",
                entityType: "assignment",
                entityId: input.id,
            });

            return { success: true };
        }),
});

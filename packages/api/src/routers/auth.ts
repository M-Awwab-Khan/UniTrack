import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { db, studentProfile, taProfile, teacherProfile, adminProfile, user } from "@uni-track/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const profileSchema = z.discriminatedUnion("role", [
    z.object({
        role: z.literal("student"),
        rollNumber: z.string(),
        department: z.string(),
        semester: z.string(),
        batch: z.string(),
    }),
    z.object({
        role: z.literal("ta"),
        department: z.string(),
        courseCode: z.string().optional(),
        inviteCode: z.string().optional(),
    }),
    z.object({
        role: z.literal("teacher"),
        // invite code handled in frontend or separate verify step? 
        // For profile creation we just need data
        department: z.string(),
    }),
    z.object({
        role: z.literal("admin"),
        // No extra fields
    }),
]);

export const authRouter = router({
    createProfile: protectedProcedure
        .input(profileSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Verify user role matches input role (security check)
            // The better-auth session should have the role if we configured it correctly.
            // If not, we might need to fetch user from DB.
            // Let's assume for now we trust the input for the profile creation or we verify against DB.

            const dbUser = await db.query.user.findFirst({
                where: eq(user.id, userId),
            });

            if (!dbUser) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }

            // Verify role match
            if (dbUser.role !== input.role) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Role mismatch" });
            }

            try {
                if (input.role === "student") {
                    await db.insert(studentProfile).values({
                        id: crypto.randomUUID(),
                        userId,
                        rollNumber: input.rollNumber,
                        department: input.department,
                        semester: input.semester,
                        batch: input.batch,
                    });
                } else if (input.role === "ta") {
                    await db.insert(taProfile).values({
                        id: crypto.randomUUID(),
                        userId,
                        department: input.department,
                        // courseCode/inviteCode might be used for other logic, but schema only has dept
                    });
                } else if (input.role === "teacher") {
                    await db.insert(teacherProfile).values({
                        id: crypto.randomUUID(),
                        userId,
                        department: input.department,
                    });
                } else if (input.role === "admin") {
                    await db.insert(adminProfile).values({
                        id: crypto.randomUUID(),
                        userId,
                    });
                }
                return { success: true };
            } catch (error) {
                console.error("Profile creation error:", error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create profile" });
            }
        }),
});

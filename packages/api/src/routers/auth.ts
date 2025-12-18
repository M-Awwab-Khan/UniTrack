import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../index";
import { db, studentProfile, taProfile, teacherProfile, adminProfile, user, taInvites, courseTas, account } from "@uni-track/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { generateId } from "better-auth";

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
        department: z.string(),
    }),
    z.object({
        role: z.literal("admin"),
    }),
]);

export const authRouter = router({
    createProfile: protectedProcedure
        .input(profileSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const dbUser = await db.query.user.findFirst({
                where: eq(user.id, userId),
            });

            if (!dbUser) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }

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

    // Register TA using invite code
    registerTaWithInvite: publicProcedure
        .input(
            z.object({
                inviteCode: z.string().min(1, "Invite code is required"),
                password: z.string().min(8, "Password must be at least 8 characters"),
            })
        )
        .mutation(async ({ input }) => {
            // Find invite by code
            const invite = await db.query.taInvites.findFirst({
                where: eq(taInvites.inviteCode, input.inviteCode),
                with: {
                    courses: {
                        with: {
                            course: true,
                        },
                    },
                    permissions: true,
                },
            });

            if (!invite) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Invalid invite code",
                });
            }

            // Validate invite status
            if (invite.status !== "active") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `This invite has been ${invite.status}`,
                });
            }

            // Check expiry
            if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
                // Mark as expired
                await db
                    .update(taInvites)
                    .set({ status: "expired" })
                    .where(eq(taInvites.id, invite.id));

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "This invite has expired",
                });
            }

            // Check if email already has account
            const existingUser = await db.query.user.findFirst({
                where: eq(user.email, invite.email),
            });

            if (existingUser) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "An account with this email already exists",
                });
            }

            // Hash password and create user
            const hashedPassword = await hashPassword(input.password);
            const userId = generateId();
            const accountId = generateId();

            // Create user
            await db.insert(user).values({
                id: userId,
                name: invite.fullName,
                email: invite.email,
                emailVerified: true, // Auto-verify since invite is pre-validated
                role: "ta",
            });

            // Create credential account for password login
            await db.insert(account).values({
                id: accountId,
                accountId: invite.email,
                providerId: "credential",
                userId: userId,
                password: hashedPassword,
            });

            // Create TA profile
            await db.insert(taProfile).values({
                id: crypto.randomUUID(),
                userId,
                department: invite.department,
            });

            // Assign courses
            if (invite.courses && invite.courses.length > 0) {
                await db.insert(courseTas).values(
                    invite.courses.map((ic) => ({
                        taId: userId,
                        courseId: ic.courseId,
                    }))
                );
            }

            // Mark invite as used
            await db
                .update(taInvites)
                .set({
                    status: "used",
                    usedAt: new Date(),
                })
                .where(eq(taInvites.id, invite.id));

            return {
                success: true,
                userId,
                message: "TA account created successfully",
            };
        }),
});

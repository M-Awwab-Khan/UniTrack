import { z } from "zod";
import { publicProcedure, protectedProcedure, createTRPCRouter as router } from "../trpc";
import { db } from "@uni-track/db";
import { studentProfile, taProfile, teacherProfile, adminProfile, user, taInvites, courseTas, account } from "@uni-track/db/schema";
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
                email: z.string().email("Invalid email address"), // Ensure email is passed and validated
                name: z.string().min(1, "Name is required"),
            })
        )
        .mutation(async ({ input }) => {
            return await db.transaction(async (tx) => {
                // 1. Find and Validate Invite
                const invite = await tx.query.taInvites.findFirst({
                    where: eq(taInvites.inviteCode, input.inviteCode),
                    with: {
                        courses: true,
                        permissions: true,
                    },
                });

                if (!invite) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Invalid invite code",
                    });
                }

                // Status Check
                if (invite.status !== "active") {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `This invite is no longer active (Status: ${invite.status})`,
                    });
                }

                // Expiry Check
                if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
                    // Auto-expire if checking
                    await tx
                        .update(taInvites)
                        .set({ status: "expired" })
                        .where(eq(taInvites.id, invite.id));

                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "This invite has expired",
                    });
                }

                // Email Match Check
                if (invite.email.toLowerCase() !== input.email.toLowerCase()) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "This invite code is not for this email address",
                    });
                }

                // Check for existing user
                const existingUser = await tx.query.user.findFirst({
                    where: eq(user.email, input.email),
                });

                if (existingUser) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "An account with this email already exists",
                    });
                }

                // 2. Create User & Account
                const hashedPassword = await hashPassword(input.password);
                const userId = generateId();
                const accountId = generateId();

                await tx.insert(user).values({
                    id: userId,
                    name: input.name,
                    email: input.email,
                    emailVerified: true,
                    role: "ta",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await tx.insert(account).values({
                    id: accountId,
                    accountId: input.email,
                    providerId: "credential",
                    userId: userId,
                    password: hashedPassword,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                // 3. Create TA Profile
                await tx.insert(taProfile).values({
                    id: crypto.randomUUID(),
                    userId,
                    department: invite.department,
                });

                // 4. Assign Courses
                if (invite.courses && invite.courses.length > 0) {
                    await tx.insert(courseTas).values(
                        invite.courses.map((ic) => ({
                            taId: userId,
                            courseId: ic.courseId,
                        }))
                    );
                }

                // 5. Mark Invite Used
                await tx
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
            });
        }),
});

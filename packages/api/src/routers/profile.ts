import { router, protectedProcedure } from "../index";
import { z } from "zod";
import { db, user, studentProfile } from "@uni-track/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const profileRouter = router({
    getProfile: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            // Fetch user basic info
            const userInfo = await db.query.user.findFirst({
                where: eq(user.id, userId),
                with: {
                    studentProfile: true,
                    taProfile: true,
                    teacherProfile: true,
                    adminProfile: true,
                }
            });

            if (!userInfo) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }

            return userInfo;
        }),

    updateBasicInfo: protectedProcedure
        .input(z.object({
            name: z.string().min(1, "Name is required"),
            // image: z.string().optional(), // Future support
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const [updatedUser] = await db
                .update(user)
                .set({
                    name: input.name,
                    updatedAt: new Date(),
                })
                .where(eq(user.id, userId))
                .returning();

            return updatedUser;
        }),

    updateStudentProfile: protectedProcedure
        .input(z.object({
            semester: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            if (ctx.session.user.role !== "student") {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only students can update this profile" });
            }

            // Check if profile exists
            const existing = await db.query.studentProfile.findFirst({
                where: eq(studentProfile.userId, userId)
            });

            if (!existing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Student profile not found" });
            }

            if (input.semester) {
                await db.update(studentProfile)
                    .set({ semester: input.semester })
                    .where(eq(studentProfile.userId, userId));
            }

            return { success: true };
        }),
});

import { createTRPCRouter as router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db } from "@uni-track/db";
import { userPreferences, notificationSettings } from "@uni-track/db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = router({
    getSettings: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            // Fetch both preferences and notifications
            // If they don't exist, return defaults (or insert defaults?) 
            // Better to insert defaults on demand or return null and let UI handle defaults.
            // But for a seamless experience, we should upsert or insert-if-missing.
            // Let's rely on finding them.

            const preferences = await db.query.userPreferences.findFirst({
                where: eq(userPreferences.userId, userId),
            });

            const notifications = await db.query.notificationSettings.findFirst({
                where: eq(notificationSettings.userId, userId),
            });

            return {
                preferences: preferences || null,
                notifications: notifications || null,
            };
        }),

    updatePreferences: protectedProcedure
        .input(z.object({
            theme: z.enum(["light", "dark", "system"]).optional(),
            defaultPage: z.enum(["dashboard", "assignments", "timetable"]).optional(),
            timeFormat: z.enum(["12h", "24h"]).optional(),
            weekStart: z.enum(["monday", "sunday"]).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Upsert
            await db.insert(userPreferences)
                .values({
                    userId,
                    ...input,
                } as any) // Type assertion if needed for partial updates on insert, but ideally we merge with defaults
                .onConflictDoUpdate({
                    target: userPreferences.userId,
                    set: {
                        ...input,
                    }
                });

            return { success: true };
        }),

    updateNotifications: protectedProcedure
        .input(z.object({
            assignmentReminders: z.boolean().optional(),
            announcementNotifications: z.boolean().optional(),
            emailNotifications: z.boolean().optional(),
            reminderTiming: z.enum(["3_days", "1_day", "same_day"]).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            await db.insert(notificationSettings)
                .values({
                    userId,
                    ...input,
                } as any)
                .onConflictDoUpdate({
                    target: notificationSettings.userId,
                    set: {
                        ...input,
                    }
                });

            return { success: true };
        }),
});

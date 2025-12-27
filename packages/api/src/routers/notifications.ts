import { createTRPCRouter as router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db } from "@uni-track/db";
import { notifications } from "@uni-track/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const notificationsRouter = router({
    // Get notifications for current user
    getAll: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(50),
                cursor: z.string().uuid().optional(), // optional cursor pagination
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const items = await db.query.notifications.findMany({
                where: (n, { eq }) => eq(n.userId, userId),
                orderBy: [desc(notifications.createdAt)],
                limit: input.limit,
            });

            return items;
        }),

    // Unread badge count
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const unread = await db.query.notifications.findMany({
            where: (n, { and, eq }) =>
                and(eq(n.userId, userId), eq(n.isRead, false)),
            columns: { id: true },
        });

        return { count: unread.length };
    }),

    // Mark single notification as read
    markAsRead: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            await db
                .update(notifications)
                .set({ isRead: true })
                .where(
                    and(
                        eq(notifications.id, input.id),
                        eq(notifications.userId, userId)
                    )
                );

            return { success: true };
        }),

    // Mark all as read
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId));

        return { success: true };
    }),
});


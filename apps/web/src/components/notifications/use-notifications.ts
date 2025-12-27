"use client";

import { api } from "@/trpc/react";

export function useNotifications() {

    const utils = api.useUtils();

    const { data: notifications, isLoading } = api.notifications.getAll.useQuery({ limit: 50 }, { refetchInterval: 60000 });

    // Use the optimized count query for the badge
    const { data: unreadData } = api.notifications.getUnreadCount.useQuery(void 0, { refetchInterval: 60000 });

    const markReadMutation = api.notifications.markAsRead.useMutation({
        onSuccess: () => {
            utils.notifications.getAll.invalidate();
            utils.notifications.getUnreadCount.invalidate();
        }
    });

    const markAllReadMutation = api.notifications.markAllAsRead.useMutation({
        onSuccess: () => {
            utils.notifications.getAll.invalidate();
            utils.notifications.getUnreadCount.invalidate();
        }
    });

    return {
        notifications: notifications || [],
        isLoading,
        unreadCount: unreadData?.count || 0,
        markAsRead: (id: string) => markReadMutation.mutate({ id }),
        markAllRead: () => markAllReadMutation.mutate(),
    };
}

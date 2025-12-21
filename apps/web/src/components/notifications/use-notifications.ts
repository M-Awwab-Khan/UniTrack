"use client";

import { useTRPC } from "@/utils/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useNotifications() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useQuery(trpc.notifications.getAll.queryOptions({ limit: 50 }, { refetchInterval: 60000 }));

    // Use the optimized count query for the badge
    const { data: unreadData } = useQuery(trpc.notifications.getUnreadCount.queryOptions(void 0, { refetchInterval: 60000 }));

    const markReadMutation = useMutation(trpc.notifications.markAsRead.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.notifications.getAll.queryKey() });
            queryClient.invalidateQueries({ queryKey: trpc.notifications.getUnreadCount.queryKey() });
        }
    }));

    const markAllReadMutation = useMutation(trpc.notifications.markAllAsRead.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.notifications.getAll.queryKey() });
            queryClient.invalidateQueries({ queryKey: trpc.notifications.getUnreadCount.queryKey() });
        }
    }));

    return {
        notifications: notifications || [],
        isLoading,
        unreadCount: unreadData?.count || 0,
        markAsRead: (id: string) => markReadMutation.mutate({ id }),
        markAllRead: () => markAllReadMutation.mutate(),
    };
}

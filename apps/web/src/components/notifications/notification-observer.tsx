"use client";

import { useEffect, useRef } from "react";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNotificationStore } from "./notification-store";

export function NotificationObserver() {
    const trpc = useTRPC();
    const { setIsOpen } = useNotificationStore();
    const lastSeenIdRef = useRef<string | null>(null);

    const { data: notifications } = useQuery(
        trpc.notifications.getAll.queryOptions(
            { limit: 50 },
            { refetchInterval: 60000 }
        )
    );

    useEffect(() => {
        if (!notifications || notifications.length === 0) return;

        const latest = notifications[0];

        // Initialize on first load
        if (lastSeenIdRef.current === null) {
            lastSeenIdRef.current = latest.id;
            return;
        }

        // If we have a new ID, it's a new notification
        if (latest.id !== lastSeenIdRef.current) {
            lastSeenIdRef.current = latest.id;

            // Only toast if it's unread
            if (!latest.isRead) {
                toast(latest.title, {
                    description: "You have a new notification",
                    action: {
                        label: "View",
                        onClick: () => setIsOpen(true),
                    },
                    duration: 10000,
                });
            }
        }
    }, [notifications, setIsOpen]);

    return null; // This component doesn't render anything
}

"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "./notification-store";
import { api } from "@/trpc/react";

export function NotificationObserver() {
    const { setIsOpen } = useNotificationStore();
    const lastSeenIdRef = useRef<string | null>(null);

    const { data: notifications } = api.notifications.getAll.useQuery(
        { limit: 50 },
        { refetchInterval: 60000 }
    );

    useEffect(() => {
        const latest = notifications?.[0];
        if (!latest) return;

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
                toast(latest.title ?? "New Notification", {
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

    return null;
}

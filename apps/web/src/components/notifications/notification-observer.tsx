"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "./notification-store";
import { api } from "@/trpc/react";
import { supabase } from "@/lib/supabase";
import { authClient } from "@/lib/auth-client";

export function NotificationObserver() {
    const { setIsOpen } = useNotificationStore();
    const utils = api.useUtils();


    const { data: session } = authClient.useSession();

    useEffect(() => {
        if (!session?.user?.id) return;

        const channel = supabase
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${session.user.id}` // Filter on the server side (Supabase) if possible, or...
                    // "filter" accepts Postgres syntax. "user_id=eq.UUID" works if the column is exposed.
                },
                (payload) => {
                    console.log("A NEW NOTIFICATION WAS INSERTED", payload);
                    const newNotification = payload.new as any;

                    // Double check (redundant if filter works but safe)
                    if (newNotification.user_id !== session.user.id) return;

                    // Play Notification Sound
                    const audio = new Audio('/notification.mp3'); // We need to add this file
                    audio.play().catch(e => console.error("Audio playback failure", e));

                    // Show Toast
                    toast(newNotification.title ?? "New Notification", {
                        description: newNotification.message || "You have a new notification",
                        action: {
                            label: "View",
                            onClick: () => setIsOpen(true),
                        },
                        duration: 5000,
                    });

                    // Invalidate Queries to refresh list and badge
                    utils.notifications.getAll.invalidate();
                    utils.notifications.getUnreadCount.invalidate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user?.id, setIsOpen, utils]);

    return null;
}

"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "./use-notifications";
import { NotificationDrawer } from "./notification-drawer";
import { useNotificationStore } from "./notification-store";

export function NotificationBell() {
    const { unreadCount } = useNotifications();
    const { isOpen, setIsOpen } = useNotificationStore();

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(true)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
                )}
            </Button>
            <NotificationDrawer open={isOpen} onOpenChange={setIsOpen} />
        </>
    );
}

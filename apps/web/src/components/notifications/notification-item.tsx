"use client";

import { cn } from "@/lib/utils";
import { useNotifications } from "./use-notifications";
import { Bell, BookOpen, Calendar, MessageSquare, AlertCircle, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "assignment": return <BookOpen className="h-4 w-4 text-blue-500" />;
        case "timetable": return <Calendar className="h-4 w-4 text-orange-500" />;
        case "announcement": return <MessageSquare className="h-4 w-4 text-purple-500" />;
        case "system": return <Info className="h-4 w-4 text-gray-500" />;
        default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
};

export function NotificationItem({ notification }: { notification: any }) {
    const { markAsRead } = useNotifications();
    const isUnread = !notification.isRead;

    return (
        <div
            className={cn(
                "group relative flex gap-4 p-3 rounded-lg border transition-all hover:bg-muted/50 cursor-pointer",
                isUnread ? "bg-muted/20 border-l-4 border-l-primary" : "bg-card border-border border-l-transparent opacity-80"
            )}
            onClick={() => {
                if (isUnread) markAsRead(notification.id);
                // Navigate logic here if needed
            }}
        >
            <div className="mt-1">
                <TypeIcon type={notification.type} />
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className={cn("text-sm font-medium leading-none", isUnread ? "font-semibold" : "")}>
                        {notification.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                </p>
                {notification.priority === "important" && (
                    <Badge variant="destructive" className="text-[10px] h-4 px-1 mt-1">Important</Badge>
                )}
            </div>
            {isUnread && (
                <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
            )}
        </div>
    );
}

"use client";

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCheck, X } from "lucide-react";
import { useNotifications } from "./use-notifications";
import { NotificationItem } from "./notification-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NotificationDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
    const { notifications, isLoading, markAllRead } = useNotifications();

    // Grouping logic (simplified for now)
    const today = new Date();
    const isToday = (date: Date) => {
        const d = new Date(date);
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col [&>button:first-of-type]:hidden">
                <SheetHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Notifications</SheetTitle>
                        <div>
                            <Tooltip>

                                <TooltipTrigger>
                                    <Button variant="ghost" size="sm" onClick={() => markAllRead()} >
                                        <CheckCheck className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Mark all read
                                </TooltipContent>
                            </Tooltip>
                            <SheetClose asChild>
                                <Button variant="ghost" size="sm" title="Close">
                                    <X className="h-4 w-4" />
                                </Button>
                            </SheetClose>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {isLoading && (
                            <div className="space-y-3">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        )}

                        {!isLoading && notifications.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>You're all caught up 🎉</p>
                            </div>
                        )}

                        {notifications.map((notification: any) => (
                            <NotificationItem key={notification.id} notification={notification} />
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

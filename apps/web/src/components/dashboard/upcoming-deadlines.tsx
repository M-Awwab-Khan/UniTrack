"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

import { format, isToday, isTomorrow } from "date-fns";

export function UpcomingDeadlines() {
    const utils = api.useUtils();
    const { data: deadlines, isLoading } = api.studentDashboard.getUpcomingDeadlines.useQuery();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Due Today":
                return "bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
            case "Upcoming":
                return "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "Overdue":
                return "bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
        if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
        return format(date, "MMM d, h:mm a");
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="bg-white dark:bg-zinc-900/50 rounded-xl border shadow-sm divide-y">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Skeleton className="h-5 w-24 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Upcoming Deadlines</h2>
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors">View all</button>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 rounded-xl border shadow-sm divide-y">
                {deadlines?.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No upcoming deadlines.
                    </div>
                )}
                {deadlines?.map((deadline, index) => (
                    <motion.div
                        key={deadline.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                    >
                        <div className="space-y-1">
                            <p className="font-medium leading-none group-hover:text-primary transition-colors">{deadline.title}</p>
                            <p className="text-sm text-muted-foreground">{deadline.courseName}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <Badge variant="outline" className={cn("font-normal pointer-events-none", getStatusColor(deadline.status))}>
                                {deadline.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(deadline.dueDate)}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

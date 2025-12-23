"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

import { formatDistanceToNow } from "date-fns";

export function RecentAnnouncements() {
    const trpc = useTRPC();
    const { data: announcements, isLoading } = useQuery(trpc.studentDashboard.getRecentAnnouncements.queryOptions());

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="grid gap-3">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 rounded-xl border bg-white dark:bg-zinc-900/50">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <Skeleton className="h-4 w-64" />
                                <Skeleton className="h-4 w-4 rounded-full" />
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
                <h2 className="text-xl font-semibold tracking-tight">Recent Announcements</h2>
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors">View all</button>
            </div>
            <div className="grid gap-3">
                {announcements?.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No recent announcements.
                    </div>
                )}
                {announcements?.map((announcement, index) => (
                    <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="group flex flex-col gap-1 p-4 rounded-xl border bg-white dark:bg-zinc-900/50 hover:bg-muted/50 transition-all cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{announcement.courseName}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <h3 className="font-medium group-hover:text-primary transition-colors">{announcement.title}</h3>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

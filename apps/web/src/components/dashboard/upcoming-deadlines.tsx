"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function UpcomingDeadlines() {
    const trpc = useTRPC();
    const { data: deadlines, isLoading } = useQuery(trpc.dashboard.getUpcomingDeadlines.queryOptions());

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
                            <p className="text-sm text-muted-foreground">{deadline.course}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <Badge variant="secondary" className={cn("font-normal pointer-events-none", deadline.statusColor)}>
                                {deadline.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{deadline.dueDate}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

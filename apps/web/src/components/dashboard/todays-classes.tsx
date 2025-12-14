"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Video } from "lucide-react";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function TodaysClasses() {
    const trpc = useTRPC();
    const { data: classes, isLoading } = useQuery(trpc.dashboard.getTodaysClasses.queryOptions());

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-7 w-40" />
                <div className="space-y-3">
                    {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border bg-white dark:bg-zinc-900/50 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Today&apos;s Classes</h2>
            <div className="space-y-3">
                {classes && classes.length > 0 ? (
                    classes.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="flex flex-col gap-3 p-4 rounded-xl border bg-white dark:bg-zinc-900/50 shadow-sm relative overflow-hidden"
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${cls.type === 'online' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{cls.name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            <span>{cls.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {cls.type === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                                            <span>{cls.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className={cls.status === 'Cancelled' ? 'text-red-500 border-red-200 bg-red-50' : 'text-green-600 border-green-200 bg-green-50'}>
                                    {cls.status}
                                </Badge>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="p-8 text-center border rounded-xl bg-muted/20 border-dashed">
                        <p className="text-muted-foreground">No classes scheduled for today.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseOverviewGrid() {
    const trpc = useTRPC();
    const { data: courses, isLoading } = useQuery(trpc.dashboard.getCourses.queryOptions());

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-24" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="flex flex-col p-5 rounded-xl border bg-white dark:bg-zinc-900/50 shadow-sm space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="mt-auto space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                                <Skeleton className="h-8 w-full" />
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
                <h2 className="text-xl font-semibold tracking-tight">My Courses</h2>
                <Button variant="ghost" size="sm">View All Courses</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {courses?.map((course, index) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="group flex flex-col p-5 rounded-xl border bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">{course.code}</span>
                                <h3 className="font-semibold text-lg leading-tight">{course.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{course.pendingTasks} tasks pending</span>
                                <span className="font-medium text-foreground">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                            <Button className="w-full opacity-0 group-hover:opacity-100 transition-opacity" variant="secondary" size="sm">View Course</Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

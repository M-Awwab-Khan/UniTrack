"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, Bell } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-background pt-20 pb-32 md:pt-32 md:pb-48">
            <div className="container mx-auto px-4 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
                        All Your Academic Life. <br className="hidden md:block" />
                        <span className="text-primary">One Place.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Assignments, deadlines, announcements, and schedules — finally organized.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Button size="lg" className="rounded-full text-lg h-12 px-8">
                            Explore the Platform
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full text-lg h-12 px-8">
                            Built for Students & Teachers
                        </Button>
                    </div>
                </motion.div>

                {/* Dashboard Mockup / Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative max-w-5xl mx-auto mt-12"
                >
                    <div className="relative rounded-xl border bg-card text-card-foreground shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
                        {/* Mockup Content Placement */}
                        <div className="absolute inset-0 grid grid-cols-12 gap-4 p-4 md:p-8 opacity-90">
                            {/* Generic Sidebar */}
                            <div className="col-span-2 hidden md:flex flex-col gap-3 border-r pr-4">
                                <div className="h-8 w-8 rounded bg-primary/20 mb-4"></div>
                                <div className="h-4 w-full rounded bg-muted"></div>
                                <div className="h-4 w-3/4 rounded bg-muted"></div>
                                <div className="h-4 w-5/6 rounded bg-muted"></div>
                            </div>
                            {/* Main Content */}
                            <div className="col-span-12 md:col-span-10 flex flex-col gap-4">
                                {/* Header */}
                                <div className="h-12 w-full border-b flex items-center justify-between">
                                    <div className="h-6 w-32 rounded bg-muted"></div>
                                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                                </div>
                                {/* Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="h-32 rounded-lg border bg-background p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            <div className="h-4 w-20 rounded bg-muted"></div>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-muted mt-8"></div>
                                    </div>
                                    <div className="h-32 rounded-lg border bg-background p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="w-4 h-4 text-blue-500" />
                                            <div className="h-4 w-20 rounded bg-muted"></div>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-muted mt-8"></div>
                                    </div>
                                    <div className="h-32 rounded-lg border bg-background p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bell className="w-4 h-4 text-green-500" />
                                            <div className="h-4 w-20 rounded bg-muted"></div>
                                        </div>
                                        <div className="space-y-2 mt-4">
                                            <div className="h-2 w-full rounded bg-muted"></div>
                                            <div className="h-2 w-2/3 rounded bg-muted"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Table/List */}
                                <div className="flex-1 rounded-lg border bg-background p-4 shadow-sm mt-4">
                                    <div className="space-y-4">
                                        <div className="h-4 w-full rounded bg-muted"></div>
                                        <div className="h-4 w-full rounded bg-muted"></div>
                                        <div className="h-4 w-full rounded bg-muted"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Elements (Parallax or simple float) */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-12 -left-8 md:-left-16 bg-card text-card-foreground p-4 rounded-xl shadow-xl border z-20 hidden md:block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Assignment Due</p>
                                <p className="text-sm font-bold">Data Structures</p>
                                <p className="text-xs text-red-500 font-medium">In 2 hours</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-8 -right-8 md:-right-16 bg-card text-card-foreground p-4 rounded-xl shadow-xl border z-20 hidden md:block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">New Announcement</p>
                                <p className="text-sm font-bold">Midterm Schedule</p>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 left-0 right-0 h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
            </div>
        </section>
    );
}

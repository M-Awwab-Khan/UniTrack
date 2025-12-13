"use client";

import { motion } from "framer-motion";
import { Bell, Clock } from "lucide-react";

export function CoreFeatures() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Core Experience</h2>
                    <p className="text-lg text-muted-foreground">Everything you need to survive and thrive.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {/* Large Card: Dashboard */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 min-h-[300px] rounded-2xl border bg-accent/30 p-8 shadow-sm relative overflow-hidden group"
                    >
                        <div className="z-10 relative">
                            <h3 className="text-2xl font-bold mb-2">Course Dashboard</h3>
                            <p className="text-muted-foreground">The command center for your degree. Lectures, files, and links.</p>
                        </div>
                        {/* Visual */}
                        <div className="absolute top-24 right-0 w-[90%] h-full bg-card rounded-tl-2xl border shadow-lg p-4 transition-transform group-hover:-translate-y-2 group-hover:-translate-x-2">
                            <div className="flex gap-4 border-b border-border pb-2 mb-4">
                                <div className="h-2 w-20 bg-muted rounded"></div>
                                <div className="h-2 w-20 bg-muted rounded"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-16 w-full bg-muted/50 rounded-lg border border-border"></div>
                                <div className="h-16 w-full bg-muted/50 rounded-lg border border-border"></div>
                                <div className="h-16 w-full bg-muted/50 rounded-lg border border-border"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Card: Deadlines */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-1 min-h-[300px] rounded-2xl border bg-accent/30 p-8 shadow-sm relative overflow-hidden group"
                    >
                        <div className="z-10 relative">
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Smart Deadlines</h3>
                            <p className="text-muted-foreground text-sm">Countdown to submission.</p>
                        </div>
                        <div className="absolute bottom-6 right-6 left-6 bg-card p-4 rounded-xl border border-border shadow-sm group-hover:scale-105 transition-transform">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold">Physics Lab</span>
                                <span className="text-xs text-red-500">2h left</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[85%]"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Card: Announcements */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-1 min-h-[300px] rounded-2xl border bg-accent/30 p-8 shadow-sm relative overflow-hidden group"
                    >
                        <div className="z-10 relative">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                <Bell className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Announcements</h3>
                            <p className="text-muted-foreground text-sm">Never miss a cancellation.</p>
                        </div>
                        <div className="absolute top-32 left-6 right-6 space-y-3">
                            <div className="bg-card p-3 rounded-lg border border-border shadow-sm text-xs group-hover:translate-x-2 transition-transform duration-300">
                                <p className="font-semibold text-primary mb-1">Dr. Smith</p>
                                <p className="text-muted-foreground">Class is rescheduled to...</p>
                            </div>
                            <div className="bg-card p-3 rounded-lg border border-border shadow-sm text-xs group-hover:-translate-x-2 transition-transform duration-300 delay-75">
                                <p className="font-semibold text-primary mb-1">Admin</p>
                                <p className="text-muted-foreground">Exam dates released...</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Large Card: Timetable */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 min-h-[300px] rounded-2xl border bg-accent/30 p-8 shadow-sm relative overflow-hidden group"
                    >
                        <div className="z-10 relative">
                            <h3 className="text-2xl font-bold mb-2">Timetable & History</h3>
                            <p className="text-muted-foreground">Weekly logical view of your time.</p>
                        </div>
                        <div className="absolute top-24 left-0 w-[90%] h-full bg-card rounded-tr-2xl border shadow-lg p-4 transition-transform group-hover:-translate-y-2 group-hover:translate-x-2">
                            <div className="grid grid-cols-5 gap-2 h-full">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="h-4 w-full bg-muted rounded"></div>
                                        <div className="flex-1 bg-muted/20 rounded relative">
                                            {i === 1 && <div className="absolute top-4 left-0 right-0 h-16 bg-blue-100 dark:bg-blue-900/20 m-1 rounded border-l-2 border-blue-500"></div>}
                                            {i === 3 && <div className="absolute top-12 left-0 right-0 h-20 bg-green-100 dark:bg-green-900/20 m-1 rounded border-l-2 border-green-500"></div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

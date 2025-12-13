"use client";

import { motion } from "framer-motion";
import { GraduationCap, CheckCircle2, Bell, Star } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
    children: React.ReactNode;
    image?: string;
    title?: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-muted/30 relative overflow-hidden items-center justify-center p-12">
                {/* Background Decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-[100px]" />
                    <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 mb-8">
                            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                                <GraduationCap className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight">UniTrack</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4 text-foreground leading-tight">
                            {title || "Your academic workspace, organized."}
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {subtitle || "Join thousands of students and faculty members managing their academic life in one unified platform."}
                        </p>
                    </motion.div>

                    {/* Visual Abstract - Floating Notifications */}
                    <div className="mt-12 relative w-full max-w-[320px]">
                        {/* Card 1: Success/Grade */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
                            transition={{
                                opacity: { delay: 0.2, duration: 0.5 },
                                x: { delay: 0.2, duration: 0.5 },
                                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="absolute -left-4 top-0 z-20 bg-background/95 backdrop-blur shadow-xl border p-4 rounded-xl w-[260px]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Assignment Submitted</p>
                                    <p className="text-xs text-muted-foreground">Data Structures • Just now</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2: Update/Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
                            transition={{
                                opacity: { delay: 0.4, duration: 0.5 },
                                x: { delay: 0.4, duration: 0.5 },
                                y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                            }}
                            className="absolute -right-8 top-20 z-10 bg-background/90 backdrop-blur shadow-lg border p-4 rounded-xl w-[240px]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Class Rescheduled</p>
                                    <p className="text-xs text-muted-foreground">Linear Algebra • 2:00 PM</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3: Grade/Result */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }}
                            transition={{
                                opacity: { delay: 0.6, duration: 0.5 },
                                scale: { delay: 0.6, duration: 0.5 },
                                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }
                            }}
                            className="absolute left-8 top-40 z-30 bg-background shadow-xl border p-4 rounded-xl w-[250px]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                    <Star className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Grade Released</p>
                                    <p className="text-xs text-muted-foreground">Physics Midterm • A+</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-md">
                    {children}
                </div>
                {/* Mobile Logo Absolute */}
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg">UniTrack</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

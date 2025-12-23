"use client";

import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import {
    BookOpen,
    Users,
    GraduationCap,
    Calendar,
    Plus,
    UserPlus,
    Settings,
    FileText
} from "lucide-react";
import { AdminStatCard } from "@/components/admin/dashboard/admin-stat-card";
import { AdminActivityItem } from "@/components/admin/dashboard/admin-activity-item";
import { AdminQuickActionButton } from "@/components/admin/dashboard/admin-quick-action-button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
    const trpc = useTRPC();

    // Fetch Data
    const { data: stats, isLoading: statsLoading } = useQuery(trpc.adminDashboard.getDashboardStats.queryOptions());
    const { data: activity, isLoading: activityLoading } = useQuery(trpc.adminDashboard.getRecentAdminActivity.queryOptions());

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your system, view statistics, and perform quick actions.
                </p>
            </div>

            {/* KPI Cards */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
                <motion.div variants={item}>
                    <AdminStatCard
                        title="Total Courses"
                        value={stats?.totalCourses ?? 0}
                        icon={BookOpen}
                        loading={statsLoading}
                    />
                </motion.div>
                <motion.div variants={item}>
                    <AdminStatCard
                        title="Total Students"
                        value={stats?.totalStudents ?? 0}
                        icon={Users}
                        loading={statsLoading}
                    />
                </motion.div>
                <motion.div variants={item}>
                    <AdminStatCard
                        title="Total TAs"
                        value={stats?.totalTAs ?? 0}
                        icon={GraduationCap}
                        loading={statsLoading}
                    />
                </motion.div>
                <motion.div variants={item}>
                    <AdminStatCard
                        title="Active Semester"
                        value={stats?.activeSemester ? "Running" : "None"}
                        subtitle={stats?.activeSemester?.name}
                        icon={Calendar}
                        loading={statsLoading}
                    />
                </motion.div>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Recent Activity */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold tracking-tight">Recent System Activity</h2>
                    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border shadow-sm">
                        {activityLoading ? (
                            <div className="p-4 space-y-4">
                                {Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : activity?.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No recent activity found.
                            </div>
                        ) : (
                            <div>
                                {activity?.map((act) => (
                                    <AdminActivityItem
                                        key={act.id}
                                        title={act.title}
                                        message={act.message}
                                        createdAt={act.createdAt}
                                        type={act.type}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
                    <div className="grid gap-4">
                        <AdminQuickActionButton
                            label="Create Course"
                            href="/admin/courses"
                            icon={Plus}
                            description="Add a new subject"
                        />
                        <AdminQuickActionButton
                            label="Invite TA"
                            href="/admin/ta-invites"
                            icon={UserPlus}
                            description="Send invite emails"
                        />
                        <AdminQuickActionButton
                            label="Manage Timetable"
                            href="/admin/timetable"
                            icon={Calendar}
                        />
                        <AdminQuickActionButton
                            label="User Management"
                            href="/admin/users"
                            icon={Settings}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

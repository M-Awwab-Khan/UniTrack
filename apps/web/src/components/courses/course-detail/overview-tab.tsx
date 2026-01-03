"use client";

import { motion } from "framer-motion";
import {
    Clock,
    FileText,
    Calendar,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    MessageCircleMore
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { TabId } from "./tabs-nav";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewTabProps {
    courseId: string;
    setTab: (tab: TabId) => void;
}

export function OverviewTab({ courseId, setTab }: OverviewTabProps) {
    const { data: stats, isLoading: isLoadingStats } = api.courses.getStats.useQuery({ courseId });
    const { data: announcements, isLoading: isLoadingAnnouncements } = api.announcements.getByCourseId.useQuery({ courseId });
    const { data: assignments, isLoading: isLoadingAssignments } = api.assignments.getByCourseId.useQuery({ courseId });

    if (isLoadingStats || isLoadingAnnouncements || isLoadingAssignments) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    <Skeleton className="md:col-span-2 h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    const recentAnnouncements = announcements?.slice(0, 3) || [];

    // Filter for upcoming assignments
    const upcomingDeadlines = (assignments || [])
        .filter(a => a.status === 'Upcoming' || a.status === 'Due Today' || a.status === 'Overdue')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3);

    const pendingCount = stats?.pendingAssignments || 0;
    const totalAssignments = stats?.totalAssignments || 0;
    const upcomingClasses = stats?.upcomingClasses || 0;
    const completedPercentage = totalAssignments > 0
        ? Math.floor(((totalAssignments - pendingCount) / totalAssignments) * 100)
        : 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Total Assignments</div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span className="text-2xl font-bold">{totalAssignments}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setTab('assignments')}>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Pending</div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <span className="text-2xl font-bold">{pendingCount}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setTab('timetable')}>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Upcoming Classes</div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <span className="text-2xl font-bold">{upcomingClasses}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Completed</div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-2xl font-bold">
                                {completedPercentage}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Deadlines */}
                <Card className="md:col-span-2 gap-0 py-0">
                    <CardHeader className="flex flex-row items-center justify-between pt-5 pb-2">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Upcoming Deadlines
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setTab('assignments')}>View All</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y relative">
                            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((assignment) => {
                                const daysLeft = differenceInDays(new Date(assignment.dueDate), new Date());
                                let urgencyColor = "bg-green-100 text-green-700";
                                if (daysLeft < 0) urgencyColor = "bg-red-100 text-red-700"; // Overdue
                                else if (daysLeft < 2) urgencyColor = "bg-amber-100 text-amber-700";
                                else if (daysLeft < 5) urgencyColor = "bg-blue-100 text-blue-700";

                                return (
                                    <div key={assignment.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer" onClick={() => setTab('assignments')}>
                                        <div className="space-y-1">
                                            <div className="font-medium">{assignment.title}</div>
                                            <div className="text-sm text-muted-foreground">{assignment.type}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant="outline" className={cn("border-0 font-medium", urgencyColor)}>
                                                {daysLeft < 0 ? "Overdue" : (daysLeft === 0 ? "Due Today" : `${daysLeft} days left`)}
                                            </Badge>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(assignment.dueDate), "MMM d, h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="p-8 text-center text-muted-foreground">No upcoming deadlines</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Announcements Preview */}
                <Card className="py-0 gap-0">
                    <CardHeader className="pt-5 pb-0">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <MessageCircleMore className="w-5 h-5" />
                            Latest Updates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentAnnouncements.length > 0 ? recentAnnouncements.map((announcement) => (
                                <div key={announcement.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setTab('announcements')}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-medium text-sm line-clamp-1">{announcement.title}</div>
                                        {announcement.isImportant && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                        {announcement.content || "No content"}
                                    </p>
                                    <div className="text-[10px] text-muted-foreground">
                                        {format(new Date(announcement.date), "MMM d")} • {announcement.author}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-muted-foreground">No announcements</div>
                            )}
                        </div>
                        <div className="p-2 border-t">
                            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setTab('announcements')}>
                                View all announcements <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}

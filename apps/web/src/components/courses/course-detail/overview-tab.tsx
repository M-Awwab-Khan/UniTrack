
"use client";

import { motion } from "framer-motion";
import {
    Clock,
    FileText,
    Calendar,
    ChevronRight,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import type { CourseDetail } from "@/components/courses/mock-course-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface OverviewTabProps {
    data: CourseDetail;
    setTab: (tab: any) => void;
}

export function OverviewTab({ data, setTab }: OverviewTabProps) {
    const upcomingDeadlines = data.assignments
        .filter(a => a.status === 'Pending')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3);

    const pendingCount = data.overview.pendingAssignments;

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
                            <span className="text-2xl font-bold">{data.overview.totalAssignments}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Pending</div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <span className="text-2xl font-bold">{pendingCount}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Upcoming Classes</div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <span className="text-2xl font-bold">{data.overview.upcomingClasses}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">Completed</div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-2xl font-bold">
                                {Math.floor(((data.overview.totalAssignments - pendingCount) / data.overview.totalAssignments) * 100)}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Deadlines */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Upcoming Deadlines
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setTab('assignments')}>View All</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((assignment) => {
                                const daysLeft = differenceInDays(new Date(assignment.dueDate), new Date());
                                let urgencyColor = "bg-green-100 text-green-700";
                                if (daysLeft < 2) urgencyColor = "bg-red-100 text-red-700";
                                else if (daysLeft < 5) urgencyColor = "bg-amber-100 text-amber-700";

                                return (
                                    <div key={assignment.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="font-medium">{assignment.title}</div>
                                            <div className="text-sm text-muted-foreground">{assignment.type}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant="outline" className={cn("border-0 font-medium", urgencyColor)}>
                                                {daysLeft === 0 ? "Due Today" : `${daysLeft} days left`}
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
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-lg font-semibold">Latest Updates</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {data.announcements.slice(0, 3).map((announcement) => (
                                <div key={announcement.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setTab('announcements')}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-medium text-sm line-clamp-1">{announcement.title}</div>
                                        {announcement.isImportant && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                        {announcement.content}
                                    </p>
                                    <div className="text-[10px] text-muted-foreground">
                                        {format(new Date(announcement.date), "MMM d")} • {announcement.author}
                                    </div>
                                </div>
                            ))}
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

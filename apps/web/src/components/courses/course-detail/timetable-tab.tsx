
"use client";

import { motion } from "framer-motion";
import type { CourseDetail } from "@/components/courses/mock-course-details";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarClock, MapPin } from "lucide-react";

interface TimetableTabProps {
    data: CourseDetail;
}

export function TimetableTab({ data }: TimetableTabProps) {
    // Separate weekly schedule from history
    const weeklySchedule = data.timetable.filter(t => !t.date);
    const history = data.timetable.filter(t => t.date).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Conducted': return "bg-green-100 text-green-700 border-green-200";
            case 'Cancelled': return "bg-red-100 text-red-700 border-red-200";
            case 'Compensatory': return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            {/* Weekly Schedule */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CalendarClock className="w-5 h-5" />
                    Weekly Schedule
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {weeklySchedule.map((session) => (
                        <Card key={session.id} className="bg-muted/30 border-dashed">
                            <CardContent className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">{session.day}</span>
                                    <Badge variant="outline">{session.status}</Badge>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Time:</span>
                                        <span className="font-medium text-foreground">{session.startTime} - {session.endTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Room:</span>
                                        <span className="font-medium text-foreground flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {session.room}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Class History */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Class History</h3>
                <div className="border rounded-lg divide-y bg-card">
                    {history.map((session) => (
                        <div key={session.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center min-w-[3rem]">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">{format(new Date(session.date!), 'MMM')}</span>
                                    <span className="text-xl font-bold">{format(new Date(session.date!), 'd')}</span>
                                </div>
                                <div>
                                    <div className="font-medium">{session.day} Session - {session.room}</div>
                                    <div className="text-sm text-muted-foreground">{session.startTime} - {session.endTime}</div>
                                </div>
                            </div>
                            <Badge variant="outline" className={cn("border", getStatusColor(session.status))}>
                                {session.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

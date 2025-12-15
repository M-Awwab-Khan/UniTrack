
"use client";

import { motion } from "framer-motion";
import type { CourseDetail } from "@/components/courses/mock-course-details";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

interface AssignmentsTabProps {
    data: CourseDetail;
}

export function AssignmentsTab({ data }: AssignmentsTabProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Submitted': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'Graded': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'Pending': return <Circle className="w-4 h-4 text-amber-500" />;
            case 'Missed': return <AlertCircle className="w-4 h-4 text-destructive" />;
            default: return <Circle className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Submitted': return 'secondary';
            case 'Graded': return 'outline';
            case 'Missed': return 'destructive';
            default: return 'default';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Assignments</CardTitle>
                    <CardDescription>Track your submissions and grades.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {data.assignments.map((assignment) => (
                            <div key={assignment.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors gap-4">
                                <div className="flex gap-4 items-start">
                                    <div className="mt-1">{getStatusIcon(assignment.status)}</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-base">{assignment.title}</h4>
                                            <Badge variant="outline" className="text-[10px] h-5">{assignment.type}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                Due {format(new Date(assignment.dueDate), "MMM d, yyyy 'at' h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 sm:text-right pl-8 sm:pl-0">
                                    {assignment.grade ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-muted-foreground">Grade</span>
                                            <span className="font-bold text-lg">{assignment.grade}</span>
                                        </div>
                                    ) : (
                                        <Badge variant={getStatusBadgeVariant(assignment.status) as any} className="capitalize">
                                            {assignment.status}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

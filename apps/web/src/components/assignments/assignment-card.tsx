
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { Clock, AlertCircle, CheckCircle2, Circle, ChevronRight, Pencil, Trash2, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Define a flexible interface that matches what API returns, extending or replacing the mock
interface AssignmentData {
    id: string;
    title: string;
    courseName: string;
    courseCode: string;
    courseColor: string;
    type: string;
    dueDate: string;
    status: string; // 'Upcoming' | 'Overdue' | 'Completed' | 'Due Today'
    description: string;
    assignedBy: string;
    submissionStatus: string; // 'Submitted' | 'Late Submission' | 'Not Submitted'
    submittedAt?: string;
    isLate?: boolean;
    attemptNumber?: number;
    courseId?: string;
}

interface AssignmentCardProps {
    assignment: AssignmentData | any; // Any to support mock if needed during transition, but prefer typed
    onClick?: () => void;
    canEdit?: boolean;
    onEdit?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
}

export function AssignmentCard({ assignment, onClick, canEdit, onEdit, onDelete }: AssignmentCardProps) {
    const dueDate = new Date(assignment.dueDate);
    const submittedAt = assignment.submittedAt ? new Date(assignment.submittedAt) : null;
    const daysLeft = differenceInDays(dueDate, new Date());

    let statusColor = "text-muted-foreground";
    let statusBg = "bg-muted";
    let statusIcon = <Circle className="w-3.5 h-3.5" />;
    let cardBorder = "border-border";

    // Priority: Submission Status -> Due Date Status
    if (assignment.submissionStatus === 'Submitted') {
        statusColor = "text-green-600";
        statusBg = "bg-green-100/50";
        statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
        cardBorder = "border-green-200 bg-green-50/5";
    } else if (assignment.submissionStatus === 'Late Submission') {
        statusColor = "text-orange-600";
        statusBg = "bg-orange-100/50";
        statusIcon = <AlertCircle className="w-3.5 h-3.5" />;
        cardBorder = "border-orange-200 bg-orange-50/5";
    } else if (assignment.status === 'Overdue') {
        statusColor = "text-red-600";
        statusBg = "bg-red-100/50";
        statusIcon = <AlertCircle className="w-3.5 h-3.5" />;
        cardBorder = "border-red-200 bg-red-50/5";
    } else if (assignment.status === 'Due Today') {
        statusColor = "text-amber-600";
        statusBg = "bg-amber-100/50";
        statusIcon = <Clock className="w-3.5 h-3.5" />;
        cardBorder = "border-amber-200 bg-amber-50/5";
    } else {
        // Upcoming / Regular
        statusIcon = <Clock className="w-3.5 h-3.5" />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            layout
        >
            <Card
                className={cn("hover:shadow-md transition-all group cursor-pointer relative", cardBorder)}
                onClick={onClick}
            >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Left Section: Icon & Info */}
                    <div className="flex gap-4 items-start w-full sm:w-auto">
                        {/* Date Box */}
                        <div className={cn("hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-lg border bg-muted/30 shrink-0", statusColor)}>
                            <span className="text-xs font-semibold uppercase">{format(dueDate, 'MMM')}</span>
                            <span className="text-xl font-bold">{format(dueDate, 'd')}</span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5", statusBg, statusColor)}>
                                    {statusIcon}
                                    {assignment.submissionStatus !== 'Not Submitted'
                                        ? assignment.submissionStatus
                                        : (assignment.status === 'Upcoming' ? (daysLeft === 0 ? "Due Today" : `Due in ${daysLeft} days`) : assignment.status)
                                    }
                                </span>
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-normal", assignment.courseColor?.replace('bg-', 'text-'))}>
                                    {assignment.courseCode}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                                    {assignment.type}
                                </Badge>
                            </div>

                            <h3 className="font-semibold text-base sm:text-lg leading-none group-hover:text-primary transition-colors">
                                {assignment.title}
                            </h3>

                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm text-muted-foreground">{assignment.courseName}</p>
                                {submittedAt && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <FileCheck className="w-3 h-3" />
                                        Submitted on: {format(submittedAt, "d MMM, h:mm a")}
                                    </p>
                                )}
                            </div>


                            {/* Mobile Only Date */}
                            <div className="sm:hidden text-xs text-muted-foreground pt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due {format(dueDate, "MMM d, h:mm a")}
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                        {canEdit && (
                            <div className="flex items-center gap-1 mr-2 bg-background/50 rounded-md p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit?.(e);
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.(e);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <Button variant="ghost" size="sm" className="hidden sm:flex h-8 gap-1 text-muted-foreground">
                            View Details
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                        {/* Mobile Action */}
                        <Button variant="outline" size="sm" className="sm:hidden w-full">
                            View Details
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

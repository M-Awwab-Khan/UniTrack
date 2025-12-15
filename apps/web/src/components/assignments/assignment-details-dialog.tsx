
"use client";

import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GlobalAssignment } from "./mock-data";
import { format, differenceInDays } from "date-fns";
import {
    Clock,
    Calendar,
    UserCircle,
    Hash,
    FileText,
    Download,
    ExternalLink,
    Info,
    ChevronRight,
    GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: GlobalAssignment | null;
}

export function AssignmentDetailsDialog({ isOpen, onClose, assignment }: AssignmentDetailsDialogProps) {
    if (!assignment) return null;

    const dueDate = new Date(assignment.dueDate);
    const daysLeft = differenceInDays(dueDate, new Date());

    let statusColor = "bg-muted text-muted-foreground";
    let statusText = assignment.status;

    if (assignment.status === 'Completed') {
        statusColor = "bg-green-100 text-green-700 hover:bg-green-200";
    } else if (assignment.status === 'Overdue') {
        statusColor = "bg-red-100 text-red-700 hover:bg-red-200";
    } else if (assignment.status === 'Due Today') {
        statusColor = "bg-amber-100 text-amber-700 hover:bg-amber-200";
    } else {
        statusColor = "bg-blue-50 text-blue-700 hover:bg-blue-100";
        statusText = (daysLeft === 0 ? "Due Today" : `Due in ${daysLeft} days`) as any;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="!max-w-3xl p-0 gap-0 overflow-hidden sm:rounded-2xl border shadow-lg">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-normal", assignment.courseColor.replace('bg-', 'text-'))}>
                                    {assignment.courseCode}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{assignment.courseName}</span>
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">
                                {assignment.title}
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <Badge className={cn("rounded-md px-2 py-0.5 text-xs font-medium border-none shadow-none", statusColor)}>
                                    {statusText}
                                </Badge>
                                <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                    {assignment.type}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                <Calendar className="w-3.5 h-3.5" /> Deadline
                            </div>
                            <p className="text-sm font-semibold">{format(dueDate, "MMM d, yyyy")}</p>
                            <p className="text-xs text-muted-foreground">{format(dueDate, "h:mm a")}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                <UserCircle className="w-3.5 h-3.5" /> Assigned By
                            </div>
                            <p className="text-sm font-semibold truncate" title={assignment.assignedBy}>{assignment.assignedBy}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                <Hash className="w-3.5 h-3.5" /> ID
                            </div>
                            <p className="text-sm font-semibold font-mono text-muted-foreground/80">#{assignment.id}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                <GraduationCap className="w-3.5 h-3.5" /> Submission
                            </div>
                            <p className={cn("text-sm font-semibold", assignment.submissionStatus === 'Submitted' ? "text-green-600" : "text-muted-foreground")}>
                                {assignment.submissionStatus}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            Description
                        </h4>
                        <div className="prose prose-sm prose-gray max-w-none bg-muted/20 p-4 rounded-lg border">
                            {/* Simple markdown rendering for demo */}
                            {assignment.description.split('\n').map((line, i) => (
                                <p key={i} className={cn("text-sm leading-relaxed", line.trim().startsWith('*') && "pl-4")}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Instructions / Policy */}
                    {assignment.instructions && (
                        <div className="flex gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100/50 text-blue-900">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <span className="font-semibold block mb-0.5">Important Note</span>
                                {assignment.instructions}
                            </div>
                        </div>
                    )}

                    {/* Resources */}
                    {assignment.resources && assignment.resources.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Download className="w-4 h-4 text-muted-foreground" />
                                Resources
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {assignment.resources.map((resource, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                                                {resource.type === 'PDF' && <FileText className="w-4 h-4" />}
                                                {resource.type === 'Doc' && <FileText className="w-4 h-4" />}
                                                {resource.type === 'Link' && <ExternalLink className="w-4 h-4" />}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium truncate">{resource.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{resource.type}</p>
                                            </div>
                                        </div>
                                        <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-muted/10 sm:justify-between items-center gap-4">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={onClose}>
                        Close
                    </Button>
                    <Button className="gap-2">
                        View Course
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


"use client";

import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    GraduationCap,
    Send,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";

interface AssignmentData {
    id: string;
    title: string;
    courseName: string;
    courseCode: string;
    courseColor: string;
    type: string;
    dueDate: string;
    status: string;
    description: string;
    assignedBy: string;
    submissionStatus: string;
    submittedAt?: string;
    isLate?: boolean;
    attemptNumber?: number;
    instructions?: string | null;
    resources?: any[]; // Keep flexible if we add resources later
    courseId?: string;
}

interface AssignmentDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: AssignmentData | any; // Support generic input
    onSuccess?: () => void; // meaningful refetch trigger
}

export function AssignmentDetailsDialog({ isOpen, onClose, assignment, onSuccess }: AssignmentDetailsDialogProps) {
    const [submissionText, setSubmissionText] = useState("");
    const utils = api.useUtils();

    const submitMutation = api.assignments.submit.useMutation({
        onSuccess: () => {
            toast.success("Assignment submitted successfully!");
            utils.assignments.getAll.invalidate();
            onSuccess?.();
            onClose();
        },
        onError: (err) => {
            toast.error(err.message || "Failed to submit assignment");
        }
    });

    if (!assignment) return null;

    const dueDate = new Date(assignment.dueDate);
    const submittedAt = assignment.submittedAt ? new Date(assignment.submittedAt) : null;
    const daysLeft = differenceInDays(dueDate, new Date());

    let statusColor = "bg-muted text-muted-foreground";
    let statusText = assignment.status;

    if (assignment.submissionStatus === 'Submitted') {
        statusColor = "bg-green-100 text-green-700";
        statusText = "Submitted";
    } else if (assignment.submissionStatus === 'Late Submission') {
        statusColor = "bg-orange-100 text-orange-700";
        statusText = "Late Submission";
    } else if (assignment.status === 'Overdue') {
        statusColor = "bg-red-100 text-red-700";
    } else if (assignment.status === 'Due Today') {
        statusColor = "bg-amber-100 text-amber-700";
    } else {
        statusColor = "bg-blue-50 text-blue-700";
        statusText = (daysLeft === 0 ? "Due Today" : `Due in ${daysLeft} days`);
    }

    const isSubmitted = assignment.submissionStatus !== 'Not Submitted';
    const canSubmit = true; // Always allow (re)submission per req

    const handleSubmit = () => {
        if (!submissionText.trim()) {
            toast.error("Please enter some text submission.");
            return;
        }
        submitMutation.mutate({
            assignmentId: assignment.id,
            submissionText: submissionText
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="!max-w-3xl p-0 gap-0 overflow-hidden sm:rounded-2xl border shadow-lg max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/30 flex-shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-normal", assignment.courseColor?.replace('bg-', 'text-'))}>
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
                                {assignment.isLate && (
                                    <Badge variant="destructive" className="rounded-md px-2 py-0.5 text-xs font-medium">
                                        Late
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
                                <GraduationCap className="w-3.5 h-3.5" /> My Status
                            </div>
                            <p className={cn("text-sm font-semibold", isSubmitted ? (assignment.isLate ? "text-orange-600" : "text-green-600") : "text-muted-foreground")}>
                                {assignment.submissionStatus}
                            </p>
                            {assignment.attemptNumber > 0 && isSubmitted && (
                                <span className="text-xs text-muted-foreground block">Attempt #{assignment.attemptNumber}</span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            Description
                        </h4>
                        <div className="prose prose-sm prose-gray max-w-none bg-muted/20 p-4 rounded-lg border">
                            {assignment.description?.split('\n').map((line: string, i: number) => (
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


                    {/* Submission Section */}
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Send className="w-4 h-4 text-muted-foreground" />
                            Your Submission
                        </h4>

                        {isSubmitted && (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                                <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Last submitted on {submittedAt ? format(submittedAt, "MMM d, yyyy 'at' h:mm a") : 'Unknown'}
                                </p>
                                <p className="text-xs text-green-700 mt-1 pl-6">
                                    {assignment.isLate ? "Marked as Late Submission" : "Submitted On Time"}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Textarea
                                placeholder="Type your submission here... (or paste link)"
                                className="min-h-[120px] resize-none focus-visible:ring-primary"
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {isSubmitted ? "Resubmitting will override your previous submission attempt." : "Once submitted, it will be marked based on the deadline."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resources
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
                )} */}

                <DialogFooter className="p-6 pt-4 border-t bg-muted/10 sm:justify-between items-center gap-4 flex-shrink-0">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={onClose}>
                        Cancel
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            className="w-full sm:w-auto gap-2"
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending}
                        >
                            {submitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSubmitted ? "Resubmit Assignment" : "Submit Assignment"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

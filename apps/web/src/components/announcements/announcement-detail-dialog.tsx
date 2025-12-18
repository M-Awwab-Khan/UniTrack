
"use client";

import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GlobalAnnouncement } from "./mock-data";
import { format } from "date-fns";
import {
    Calendar,
    UserCircle,
    FileText,
    ExternalLink,
    Paperclip,
    AlertCircle,
    Megaphone,
    X,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    announcement: GlobalAnnouncement | null;
}

export function AnnouncementDetailDialog({ isOpen, onClose, announcement }: AnnouncementDetailDialogProps) {
    if (!announcement) return null;

    const isImportant = announcement.priority === 'Important';
    const date = new Date(announcement.date);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden sm:rounded-2xl border shadow-xl">
                {/* Header */}
                <div className={cn(
                    "relative p-6 pb-6 border-b",
                    isImportant ? "bg-red-50/50" : "bg-muted/10"
                )}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-4">
                            {/* Tags & Meta */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={cn("bg-background", announcement.courseColor.replace('bg-', 'text-'))}>
                                    {announcement.courseCode}
                                </Badge>
                                <span className="text-sm font-medium text-muted-foreground">{announcement.courseName}</span>
                                {isImportant && (
                                    <Badge variant="destructive" className="ml-2 gap-1 px-2">
                                        <AlertCircle className="w-3 h-3" />
                                        Important
                                    </Badge>
                                )}
                            </div>

                            <DialogTitle className="text-2xl font-bold leading-tight tracking-tight">
                                {announcement.title}
                            </DialogTitle>
                        </div>
                        {/* <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button> */}
                    </div>

                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md border border-transparent">
                            <UserCircle className="w-4 h-4 text-primary/70" />
                            <span className="font-medium text-foreground">{announcement.author}</span>
                            <span className="text-xs opacity-70">({announcement.role})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 opacity-70" />
                            <span>{format(date, "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 opacity-70" />
                            <span>{format(date, "h:mm a")}</span>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 md:p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                    <div className="prose prose-sm prose-stone max-w-none">
                        {announcement.content.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="leading-relaxed text-base text-foreground/90 mb-4">{paragraph}</p>
                        ))}
                    </div>

                    {/* Attachments */}
                    {announcement.attachments && announcement.attachments.length > 0 && (
                        <div className="border-t pt-6 mt-6">
                            <h4 className="text-sm font-semibold flex items-center gap-2 mb-4 text-muted-foreground uppercase tracking-wider">
                                <Paperclip className="w-4 h-4" />
                                Attachments ({announcement.attachments.length})
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {announcement.attachments.map((file, idx) => (
                                    <a
                                        key={idx}
                                        href={file.url}
                                        className="flex items-center p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-sidebar-accent transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-background group-hover:text-primary transition-colors">
                                            {file.type === 'PDF' ? <FileText className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{file.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{file.type}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="p-4 border-t bg-muted/5 sm:justify-between items-center">
                    <div className="text-xs text-muted-foreground pl-2 italic">
                        Posted in {announcement.courseName}
                    </div>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

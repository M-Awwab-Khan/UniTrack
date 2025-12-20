
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GlobalAnnouncement } from "./mock-data";
import { Badge } from "@/components/ui/badge";
import { Calendar, UserCircle, AlertCircle, Paperclip, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";


interface AnnouncementCardProps {
    announcement: GlobalAnnouncement;
    onClick: () => void;
    canEdit?: boolean;
    onEdit?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
}

export function AnnouncementCard({ announcement, onClick, canEdit, onEdit, onDelete }: AnnouncementCardProps) {
    const isImportant = announcement.priority === 'Important';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={onClick}
            className={cn(
                "group relative bg-card hover:bg-accent/5 rounded-xl border p-5 shadow-sm transition-all cursor-pointer overflow-hidden",
                isImportant && "border-l-4 border-l-red-500 shadow-red-100/50"
            )}
        >
            {/* TA Actions */}
            {canEdit && (
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 rounded-md p-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(e);
                        }}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(e);
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-normal", announcement.courseColor.replace('bg-', 'text-'))}>
                                {announcement.courseCode}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium truncate max-w-[200px]">{announcement.courseName}</span>
                        </div>
                        <h3 className={cn("text-base sm:text-lg font-bold leading-tight group-hover:text-primary transition-colors", isImportant && "text-red-900 dark:text-red-200")}>
                            {announcement.title}
                        </h3>
                    </div>
                    {isImportant && (
                        <div className="flex-shrink-0" title="Important Priority">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                    )}
                </div>

                {/* Content Preview */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {announcement.content}
                </p>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-100 mt-1">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <UserCircle className="w-3.5 h-3.5" />
                            <span>{announcement.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDistanceToNow(new Date(announcement.date), { addSuffix: true })}</span>
                        </div>
                    </div>

                    {announcement.attachments && announcement.attachments.length > 0 && (
                        <Badge variant="secondary" className="gap-1 text-[10px] font-normal px-2 bg-muted/50 text-muted-foreground group-hover:bg-background">
                            <Paperclip className="w-3 h-3" />
                            {announcement.attachments.length}
                        </Badge>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

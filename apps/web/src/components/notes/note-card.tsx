
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GlobalNote } from "./mock-data";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    File,
    Link as LinkIcon,
    Presentation,
    BookOpen,
    Download,
    Eye,
    Calendar,
    UserCircle,
    Pencil,
    Trash2
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
    note: GlobalNote;
    onClick: () => void;
    canEdit?: boolean;
    onEdit?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
}

export function NoteCard({ note, onClick, canEdit, onEdit, onDelete }: NoteCardProps) {
    const getIcon = (type: GlobalNote['type']) => {
        switch (type) {
            case 'PDF':
            case 'Lecture Notes': return <FileText className="w-10 h-10 text-red-500" />;
            case 'Slides': return <Presentation className="w-10 h-10 text-orange-500" />;
            case 'Lab Manual': return <File className="w-10 h-10 text-blue-500" />;
            case 'Link': return <LinkIcon className="w-10 h-10 text-indigo-500" />;
            case 'Reference': return <BookOpen className="w-10 h-10 text-green-500" />;
            default: return <FileText className="w-10 h-10 text-gray-500" />;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={onClick}
            className="group relative bg-card hover:bg-accent/5 rounded-xl border p-4 shadow-sm transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
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

            {note.isNew && (
                <div className="absolute top-3 right-3">
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] px-1.5 h-5">NEW</Badge>
                </div>
            )}

            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-muted/30 rounded-lg group-hover:bg-muted/50 transition-colors">
                    {getIcon(note.type)}
                </div>
                <div className="space-y-1">
                    <div className="flex flex-wrap gap-2 mb-1">
                        <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-normal border-0 bg-opacity-10", note.courseColor.replace('bg-', 'bg-').replace('bg-', 'text-'))}>
                            {note.courseCode}
                        </Badge>
                        {note.week && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground bg-muted/50">
                                {note.week}
                            </Badge>
                        )}
                    </div>
                    <h3 className="font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {note.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{note.type}</p>
                </div>
            </div>

            <div className="mt-auto space-y-3">
                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-1.5">
                        <UserCircle className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[80px] sm:max-w-[120px]">{note.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(new Date(note.uploadDate), "MMM d")}</span>
                    </div>
                </div>

                {/* Hover Action Overlay (optional or integrated)
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                    </span>
                </div> */}
            </div>
        </motion.div>
    );
}

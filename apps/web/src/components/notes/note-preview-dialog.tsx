
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GlobalNote } from "./mock-data";
import { format } from "date-fns";
import {
    FileText,
    Share2,
    Download,
    Maximize2,
    X,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotePreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    note: GlobalNote | null;
}

export function NotePreviewDialog({ isOpen, onClose, note }: NotePreviewDialogProps) {
    if (!note) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-2xl border shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 px-6 border-b bg-muted/10">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-2 bg-background rounded-lg border shadow-sm flex-shrink-0">
                            {/* Simple Icon based on type */}
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h2 className="font-bold text-lg leading-none truncate">
                                    {note.title}
                                </h2>
                                <Badge variant="secondary" className="text-[10px] h-5 font-normal px-1.5 bg-muted text-muted-foreground border-0">
                                    {note.type}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                                {note.courseName} • {note.uploadedBy}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-muted/20 relative flex items-center justify-center p-8 overflow-hidden">
                    <div className="text-center space-y-4 max-w-md">
                        <div className="w-24 h-32 mx-auto bg-white border shadow-sm rounded-sm flex items-center justify-center relative group cursor-pointer hover:scale-105 transition-transform">
                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white" />
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <FileText className="w-8 h-8 text-gray-300" />
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Preview</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-muted-foreground text-sm">
                                Preview not available for this file type.
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                                {note.fileSize ? `File Size: ${note.fileSize}` : 'External Resource'}
                            </p>
                        </div>

                        <Button className="gap-2 w-full sm:w-auto">
                            {note.type === 'Link' ? (
                                <>
                                    <ExternalLink className="w-4 h-4" /> Open Link
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" /> Download File
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Footer / Description */}
                {(note.description || note.week) && (
                    <div className="p-4 px-6 border-t bg-background text-sm text-muted-foreground flex justify-between items-center gap-4">
                        <p className="truncate flex-1">
                            {note.description || "No description provided."}
                        </p>
                        {note.week && (
                            <Badge variant="outline" className="flex-shrink-0">
                                {note.week}
                            </Badge>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

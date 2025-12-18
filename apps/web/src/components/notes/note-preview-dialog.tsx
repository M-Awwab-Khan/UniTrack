
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GlobalNote } from "./mock-data";
import { format } from "date-fns";
import {
    FileText,
    Download,
    X,
    ExternalLink,
    Calendar,
    User,
    HardDrive,
    File
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
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 sm:rounded-2xl border shadow-2xl overflow-hidden focus:outline-none">
                {/* 1. Modal Header */}
                <div className="flex items-start justify-between p-5 pb-4 border-b bg-background z-10">
                    <div className="space-y-1 pr-8">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-normal border-0 bg-opacity-10", note.courseColor.replace('bg-', 'bg-').replace('bg-', 'text-'))}>
                                {note.courseCode}
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground">{note.courseName}</span>
                            <Badge variant="secondary" className="ml-2 text-[10px] h-5 px-2 bg-muted text-muted-foreground hover:bg-muted/80">
                                {note.type}
                            </Badge>
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-foreground">
                            {note.title}
                        </DialogTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mr-2 text-muted-foreground hover:bg-muted">
                        <X className="w-5 h-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                {/* 2. Metadata Section */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-3 px-5 bg-muted/30 border-b text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        <span>Uploaded by <span className="font-medium text-foreground">{note.uploadedBy}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(new Date(note.uploadDate), "MMM d, yyyy")}</span>
                    </div>
                    {(note.fileSize || note.type !== 'Link') && (
                        <div className="flex items-center gap-2">
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>{note.fileSize || 'Unknown Size'}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <File className="w-3.5 h-3.5" />
                        <span>{note.type}</span>
                    </div>
                </div>

                {/* 3. Notes Content / Preview Area */}
                <div className="flex-1 bg-muted/10 relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
                    {note.type === 'Link' ? (
                        <div className="w-full max-w-lg bg-card border rounded-xl p-6 shadow-sm text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <ExternalLink className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">External Resource</h3>
                                <p className="text-sm text-muted-foreground mt-1 break-all px-4">
                                    {note.url === '#' ? 'https://example.com/resource' : note.url}
                                </p>
                            </div>
                            <Button className="gap-2 w-full" onClick={() => window.open(note.url, '_blank')}>
                                <ExternalLink className="w-4 h-4" />
                                Open in New Tab
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full max-w-3xl h-full flex flex-col shadow-sm border bg-white rounded-lg overflow-hidden">
                            {/* Mock Preview Header */}
                            <div className="h-10 bg-gray-100 border-b flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                </div>
                                <div className="mx-auto w-1/3 h-2 bg-gray-200 rounded-full"></div>
                            </div>
                            {/* Mock Preview Content */}
                            <div className="flex-1 p-8 sm:p-12 overflow-y-auto bg-white flex flex-col items-center gap-6">
                                <div className="w-full h-4 bg-gray-100 rounded animate-pulse"></div>
                                <div className="w-3/4 h-4 bg-gray-100 rounded animate-pulse self-start"></div>
                                <div className="w-5/6 h-4 bg-gray-100 rounded animate-pulse self-start"></div>
                                <div className="w-full h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center">
                                    <div className="text-center space-y-2">
                                        <FileText className="w-8 h-8 text-gray-200 mx-auto" />
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Preview Page 1</p>
                                    </div>
                                </div>
                                <div className="w-full h-4 bg-gray-100 rounded animate-pulse"></div>
                                <div className="w-4/5 h-4 bg-gray-100 rounded animate-pulse self-start"></div>
                            </div>
                            {/* Overlay for "Preview Only" */}
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* 4. Description & 5. Footer Actions */}
                <div className="bg-background border-t">
                    {/* Description */}
                    {note.description && (
                        <div className="px-6 py-4 border-b border-dashed">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
                            <p className="text-sm text-foreground/80 italic leading-relaxed">
                                "{note.description}"
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground hidden sm:flex">
                            {note.week && (
                                <Badge variant="outline" className="font-normal">
                                    {note.week}
                                </Badge>
                            )}
                            <span>{note.type === 'Link' ? 'External' : 'Downloadable File'}</span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                                Close
                            </Button>
                            {note.type !== 'Link' && (
                                <Button className="flex-1 sm:flex-none gap-2">
                                    <Download className="w-4 h-4" />
                                    Download Notes
                                </Button>
                            )}
                            {note.type === 'Link' && (
                                <Button className="flex-1 sm:flex-none gap-2" onClick={() => window.open(note.url, '_blank')}>
                                    <ExternalLink className="w-4 h-4" />
                                    Open Link
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

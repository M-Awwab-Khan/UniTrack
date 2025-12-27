
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
    File,
    Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotePreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    note: GlobalNote | null;
}

export function NotePreviewDialog({ isOpen, onClose, note }: NotePreviewDialogProps) {
    const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null);

    useEffect(() => {
        if (note?.attachments && note.attachments.length > 0) {
            setSelectedAttachmentId(note.attachments[0]!.id);
        } else {
            setSelectedAttachmentId(null);
        }
    }, [note]);

    if (!note) return null;

    const selectedAttachment = note.attachments.find(a => a.id === selectedAttachmentId);

    // Prepare docs for DocViewer
    // Note: DocViewer expects uri. For 'file', it's the url. For 'link', we might not preview it directly or use an iframe if we wanted, but standard links are better opened.
    const docs = selectedAttachment && selectedAttachment.type === 'file'
        ? [{ uri: selectedAttachment.url, fileName: selectedAttachment.name, fileType: selectedAttachment.mimeType || undefined }]
        : [];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="!max-w-3xl h-[90vh] flex flex-col p-0 gap-0 sm:rounded-2xl border shadow-2xl overflow-hidden focus:outline-none">
                {/* 1. Modal Header */}
                <div className="flex items-start justify-between p-5 pb-4 border-b bg-background z-10 shrink-0">
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
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-3 px-5 bg-muted/30 border-b text-xs text-muted-foreground shrink-0">
                    <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        <span>Uploaded by <span className="font-medium text-foreground">{note.uploadedBy}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(new Date(note.uploadDate), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{note.attachments.length} attachment{note.attachments.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* 3. Main Content: Sidebar + Preview */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Attachment Sidebar */}
                    <div className="w-64 border-r bg-muted/10 shrink-0 flex flex-col">
                        <div className="p-3 border-b text-xs font-semibold text-muted-foreground bg-muted/20">
                            Attachments
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1 w-64">
                                {note.attachments.map((att) => (
                                    <button
                                        key={att.id}
                                        onClick={() => setSelectedAttachmentId(att.id)}
                                        className={cn(
                                            "w-full flex items-start gap-3 p-3 text-left rounded-lg text-sm transition-colors",
                                            selectedAttachmentId === att.id
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "hover:bg-muted text-foreground border border-transparent"
                                        )}
                                    >
                                        {att.type === 'link' ? <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" /> : <FileText className="w-4 h-4 mt-0.5 shrink-0" />}
                                        <div className="min-w-0 w-full flex-1">
                                            <p className="font-medium truncate leading-tight">{att.name}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {att.type === 'link' ? 'External Link' : att.fileSize ? `${(att.fileSize / 1024 / 1024).toFixed(2)} MB` : 'File'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                                {note.attachments.length === 0 && (
                                    <div className="p-4 text-center text-muted-foreground text-xs">
                                        No attachments found.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 bg-muted/5 relative flex flex-col overflow-hidden">
                        {selectedAttachment ? (
                            selectedAttachment.type === 'link' ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                        <ExternalLink className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">External Link</h3>
                                    <p className="text-sm text-muted-foreground mb-6 max-w-md break-all">
                                        {selectedAttachment.url}
                                    </p>
                                    <Button onClick={() => window.open(selectedAttachment.url, '_blank')} className="gap-2">
                                        Open in New Tab <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex-1 w-full h-full">
                                    <DocViewer
                                        documents={docs}
                                        pluginRenderers={DocViewerRenderers}
                                        className="h-full w-full"
                                        style={{ height: '100%', background: 'transparent' }}
                                        config={{
                                            header: {
                                                disableHeader: true,
                                                disableFileName: true,
                                                retainURLParams: false
                                            }
                                        }}
                                    />
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <FileText className="w-12 h-12 mb-4 opacity-20" />
                                <p>Select an attachment to preview</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Footer Description (Optional) */}
                {note.description && (
                    <div className="max-h-[100px] bg-background border-t p-3 px-5 text-xs text-muted-foreground shrink-0 max-h-[60px] overflow-y-auto">
                        <span className="font-semibold mr-1">Description:</span>
                        {note.description}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

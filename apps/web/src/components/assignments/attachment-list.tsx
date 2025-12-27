"use client";

import { FileText, Link as LinkIcon, Download, ExternalLink, Trash2, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AttachmentItem {
    id?: string; // Optional because pending attachments might not have ID yet
    type: "file" | "link";
    name: string;
    url?: string; // Pending files might not have URL yet
    fileSize?: number;
    publicId?: string;
    isLoading?: boolean; // For showing loading state during deletion or upload if needed
}

interface AttachmentListProps {
    attachments: AttachmentItem[];
    onDelete?: (attachment: AttachmentItem) => void;
    canEdit?: boolean;
    isDeletingId?: string | null;
}

export function AttachmentList({ attachments, onDelete, canEdit = false, isDeletingId }: AttachmentListProps) {
    if (!attachments.length) {
        return (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground text-sm">
                <Paperclip className="w-8 h-8 opacity-20 mb-2" />
                <p>No attachments added yet.</p>
            </div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 gap-3">
            {attachments.map((attachment, idx) => {
                const isDeleting = isDeletingId === attachment.id;

                return (
                    <div key={attachment.id || idx} className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors group relative">
                        <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                                {attachment.type === 'file' ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                            </div>
                            <div className="truncate flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" title={attachment.name}>
                                    {attachment.name}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase">
                                    <span>{attachment.type}</span>
                                    {attachment.fileSize && <span>• {(attachment.fileSize / 1024).toFixed(0)} KB</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {attachment.url && (
                                <a href={attachment.url} target="_blank" rel="noreferrer">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                        {attachment.type === 'file' ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                                    </Button>
                                </a>
                            )}

                            {canEdit && onDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    disabled={isDeleting || attachment.isLoading}
                                    onClick={() => onDelete(attachment)}
                                >
                                    {(isDeleting || attachment.isLoading) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

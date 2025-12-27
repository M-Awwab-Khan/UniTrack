"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Loader2, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttachmentData {
    type: "file" | "link";
    name: string;
    value: string; // Base64 for file, URL for link
    fileSize?: number;
    mimeType?: string;
    fileObject?: File; // Optional, for display purposes or future use
}

interface AddAttachmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (attachment: AttachmentData) => Promise<void> | void;
    isSubmitting?: boolean;
}

export function AddAttachmentDialog({ open, onOpenChange, onAdd, isSubmitting = false }: AddAttachmentDialogProps) {
    const [activeTab, setActiveTab] = useState<"file" | "link">("file");
    const [file, setFile] = useState<File | null>(null);
    const [linkName, setLinkName] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError(null);
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                setFile(null);
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async () => {
        setError(null);

        if (activeTab === "file") {
            if (!file) {
                setError("Please select a file");
                return;
            }

            // Read file as base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result as string;
                try {
                    await onAdd({
                        type: "file",
                        name: file.name,
                        value: base64,
                        fileSize: file.size,
                        mimeType: file.type,
                        fileObject: file
                    });
                    handleClose();
                } catch (err: any) {
                    setError(err.message || "Failed to add attachment");
                }
            };
            reader.onerror = () => {
                setError("Failed to read file");
            };
        } else {
            if (!linkUrl || !linkName) {
                setError("Please enter both name and URL");
                return;
            }
            try {
                new URL(linkUrl);
            } catch {
                setError("Invalid URL format");
                return;
            }

            try {
                await onAdd({
                    type: "link",
                    name: linkName,
                    value: linkUrl
                });
                handleClose();
            } catch (err: any) {
                setError(err.message || "Failed to add link");
            }
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setFile(null);
        setLinkName("");
        setLinkUrl("");
        setError(null);
        setActiveTab("file");
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Attachment</DialogTitle>
                    <DialogDescription>
                        Attach a file or add an external link to this assignment.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "file" | "link")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="file">File Upload</TabsTrigger>
                        <TabsTrigger value="link">External Link</TabsTrigger>
                    </TabsList>

                    <div className="py-4 space-y-4">
                        <TabsContent value="file" className="mt-0 space-y-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="file">File</Label>
                                <div className={cn(
                                    "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer",
                                    file ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                                )}>
                                    <Input
                                        id="file"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.md,.txt"
                                    />
                                    <Label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                                        {file ? (
                                            <>
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-7 text-xs mt-2" onClick={(e) => {
                                                    e.preventDefault();
                                                    setFile(null);
                                                }}>
                                                    Remove
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground">Max 5MB (PDF, DOC, XLS, MD, TXT)</p>
                                                </div>
                                            </>
                                        )}
                                    </Label>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="link" className="mt-0 space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="linkName">Name</Label>
                                <Input
                                    id="linkName"
                                    placeholder="e.g. Project Guidelines"
                                    value={linkName}
                                    onChange={(e) => setLinkName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="linkUrl">URL</Label>
                                <Input
                                    id="linkUrl"
                                    placeholder="https://"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Attachment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

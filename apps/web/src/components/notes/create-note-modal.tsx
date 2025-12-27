"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Paperclip, Plus } from "lucide-react";
import { AttachmentList } from "../assignments/attachment-list";
import { AddAttachmentDialog } from "../assignments/add-attachment-dialog";
import { Label } from "@/components/ui/label";

interface AttachmentItem {
    id: string;
    type: "file" | "link";
    name: string;
    url?: string;
    value?: string;
    fileSize?: number;
    mimeType?: string;
}

// Matches DB enum or whatever we set in schema.
// const noteTypeEnum = pgEnum("type", ["Lecture Notes", "Slides", "Lab Manual", "Reference", "Link", "PDF"]); 
const noteTypes = ["Lecture Notes", "Slides", "Lab Manual", "Reference", "Link", "PDF"] as const;

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    courseId: z.string().uuid("Please select a course"),
    type: z.enum(noteTypes),
    week: z.string().optional(),
});

interface CreateNoteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateNoteModal({ open, onOpenChange }: CreateNoteModalProps) {
    const utils = api.useUtils();
    const [courses, setCourses] = useState<{ id: string; name: string; code: string }[]>([]);

    const { data: allCourses } = api.courses.getAllCourses.useQuery({});

    useEffect(() => {
        if (allCourses) {
            setCourses(allCourses);
        }
    }, [allCourses]);

    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [isAddAttachmentOpen, setIsAddAttachmentOpen] = useState(false);

    const handleAddAttachment = (attachment: any) => {
        setAttachments([...attachments, { ...attachment, id: `pending-${Date.now()}` }]);
    };

    const handleRemoveAttachment = (attachment: any) => {
        setAttachments(attachments.filter(a => a.id !== attachment.id));
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            type: "Lecture Notes",
            week: "",
        },
    });

    const createMutation = api.notes.create.useMutation({
        onSuccess: () => {
            toast.success("Note created successfully");
            onOpenChange(false);
            form.reset();
            setAttachments([]);
            utils.notes.getAll.invalidate();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create note");
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        createMutation.mutate({
            title: values.title,
            description: values.description,
            courseId: values.courseId,
            type: values.type,
            week: values.week,
            attachments: attachments.map(a => ({
                type: a.type,
                name: a.name,
                value: (a as any).value || a.url || "",
                fileSize: a.fileSize,
                mimeType: a.mimeType,
            }))
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Note</DialogTitle>
                    <DialogDescription>
                        Upload a file or add a link for students.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Note Title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="courseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Course</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Course" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {courses.map((course) => (
                                                    <SelectItem key={course.id} value={course.id}>
                                                        {course.code} - {course.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {noteTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="week"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Week/Topic (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Week 1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Brief description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                                    Attachments
                                </Label>
                                {attachments.length < 10 && (
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddAttachmentOpen(true)} className="h-7 text-xs gap-1">
                                        <Plus className="w-3.5 h-3.5" /> Add
                                    </Button>
                                )}
                            </div>

                            <AttachmentList
                                attachments={attachments}
                                onDelete={handleRemoveAttachment}
                                canEdit={true}
                            />
                        </div>

                        <AddAttachmentDialog
                            open={isAddAttachmentOpen}
                            onOpenChange={setIsAddAttachmentOpen}
                            onAdd={handleAddAttachment}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Note
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    );
}

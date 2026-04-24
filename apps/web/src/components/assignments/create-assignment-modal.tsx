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
import { Label } from "@/components/ui/label";
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
import { AddAttachmentDialog } from "./add-attachment-dialog";
import { AttachmentList, AttachmentItem } from "./attachment-list";
import { Paperclip, Plus } from "lucide-react";

// Enum match backend
const assignmentTypes = ["Lab", "Assignment", "Quiz", "Project", "Presentation"] as const;

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    courseId: z.string().uuid("Please select a course"),
    type: z.enum(assignmentTypes),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
    dueTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time"),
    instructions: z.string().optional(),
});

interface CreateAssignmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: "create" | "edit";
    initialData?: {
        id: string;
        title: string;
        description: string;
        courseId: string;
        type: (typeof assignmentTypes)[number];
        dueDate: string;
        instructions?: string | null;
    } | null;
    onSuccess?: () => void;
}

export function CreateAssignmentModal({
    open,
    onOpenChange,
    mode = "create",
    initialData,
    onSuccess,
}: CreateAssignmentModalProps) {
    const utils = api.useUtils();
    const [courses, setCourses] = useState<{ id: string; name: string; code: string }[]>([]);

    // Fetch courses for basic selection (ideally filtered by permissions)
    // admin.getAllCourses returns all. We might need a "getMyCourses" for TA.
    // For now using admin.getAllCourses but user can only assign if they are TA.
    // Better: use a procedure that returns only courses where user is TA.
    // Let's assume admin.getAllCourses is what we have or add a new one?
    // The previous plan didn't specify "getMyCourses".
    // I will use getAllCourses and frontend filtering or just show all and backend rejects.
    // Wait, `trpc.admin.getAllCourses` exists.
    const { data: allCourses } = api.courses.getAllCourses.useQuery({});

    useEffect(() => {
        if (allCourses) {
            setCourses(allCourses.map(c => ({
                id: c.id,
                name: c.name,
                code: c.code
            })));
        }
    }, [allCourses]);

    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [isAddAttachmentOpen, setIsAddAttachmentOpen] = useState(false);

    const handleAddAttachment = (attachment: any) => {
        setAttachments([...attachments, { ...attachment, id: `pending-${Date.now()}` }]);
    };

    const handleRemoveAttachment = (attachment: AttachmentItem) => {
        setAttachments(attachments.filter(a => a.id !== attachment.id));
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            type: "Assignment",
            instructions: "",
            dueDate: new Date().toISOString().split("T")[0],
            dueTime: "23:59",
        },
    });

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialData) {
            const dueDate = new Date(initialData.dueDate);
            const formattedDate = Number.isNaN(dueDate.getTime())
                ? new Date().toISOString().split("T")[0]
                : dueDate.toISOString().split("T")[0];
            const formattedTime = Number.isNaN(dueDate.getTime())
                ? "23:59"
                : dueDate.toTimeString().slice(0, 5);

            form.reset({
                title: initialData.title,
                description: initialData.description,
                courseId: initialData.courseId,
                type: initialData.type,
                instructions: initialData.instructions ?? "",
                dueDate: formattedDate,
                dueTime: formattedTime,
            });
            setAttachments([]);
            return;
        }

        form.reset({
            title: "",
            description: "",
            type: "Assignment",
            instructions: "",
            dueDate: new Date().toISOString().split("T")[0],
            dueTime: "23:59",
            courseId: "",
        });
        setAttachments([]);
    }, [open, mode, initialData, form]);

    const createMutation = api.assignments.create.useMutation({
        onSuccess: () => {
            toast.success("Assignment created successfully");
            onOpenChange(false);
            form.reset();
            utils.assignments.invalidate();
            onSuccess?.();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create assignment");
        },
    });

    const updateMutation = api.assignments.update.useMutation({
        onSuccess: () => {
            toast.success("Assignment updated successfully");
            onOpenChange(false);
            utils.assignments.invalidate();
            onSuccess?.();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to update assignment");
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Combine date and time
        const dateTime = new Date(`${values.dueDate}T${values.dueTime}`);

        if (mode === "edit" && initialData) {
            updateMutation.mutate({
                id: initialData.id,
                title: values.title,
                description: values.description,
                type: values.type,
                dueDate: dateTime.toISOString(),
                instructions: values.instructions,
            });
            return;
        }

        createMutation.mutate({
            title: values.title,
            description: values.description,
            courseId: values.courseId,
            type: values.type,
            dueDate: dateTime.toISOString(),
            instructions: values.instructions,
            attachments: attachments.map(a => ({
                type: a.type,
                name: a.name,
                value: (a as any).value,
                fileSize: a.fileSize,
                mimeType: (a as any).mimeType,
            }))
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === "edit" ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
                    <DialogDescription>
                        {mode === "edit"
                            ? "Update assignment details."
                            : "Create a new assignment for your course."}
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
                                        <Input placeholder="Assignment Title" {...field} />
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
                                        <Select onValueChange={field.onChange} value={field.value} disabled={mode === "edit"}>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {assignmentTypes.map((type) => (
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Brief description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instructions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instructions (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Detailed instructions..." className="h-32" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {mode === "create" && (
                            <>
                                {/* Attachments Section */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2">
                                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                                            Attachments
                                        </Label>
                                        {attachments.length < 3 && (
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
                            </>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === "edit" ? "Save Changes" : "Create Assignment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

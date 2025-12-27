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
    // We might need to pass available courses if not fetching inside
    // For now let's fetch inside or reuse a query if available.
    // Ideally we fetch courses TAs are assigned to.
}

export function CreateAssignmentModal({ open, onOpenChange }: CreateAssignmentModalProps) {
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
            setCourses(allCourses);
        }
    }, [allCourses]);

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

    const createMutation = api.assignments.create.useMutation({
        onSuccess: () => {
            toast.success("Assignment created successfully");
            onOpenChange(false);
            form.reset();
            utils.assignments.invalidate();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create assignment");
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Combine date and time
        const dateTime = new Date(`${values.dueDate}T${values.dueTime}`);

        createMutation.mutate({
            title: values.title,
            description: values.description,
            courseId: values.courseId,
            type: values.type,
            dueDate: dateTime.toISOString(),
            instructions: values.instructions,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Assignment</DialogTitle>
                    <DialogDescription>
                        Create a new assignment for your course.
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

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Assignment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

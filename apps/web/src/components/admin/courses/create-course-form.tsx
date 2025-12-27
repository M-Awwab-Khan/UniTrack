"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const formSchema = z.object({
    code: z.string().min(1, "Course code is required").toUpperCase(),
    name: z.string().min(1, "Course name is required"),
    department: z.string().min(1, "Department is required"),
    semester: z.string().optional().or(z.literal("")),
    creditHours: z.coerce.number().int().positive("Credit hours must be positive").optional(),
    description: z.string().optional().or(z.literal("")),
    status: z.enum(["active", "archived"]),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCourseFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CreateCourseForm({ onSuccess, onCancel }: CreateCourseFormProps) {
    const utils = api.useUtils();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            code: "",
            name: "",
            department: "",
            semester: "",
            creditHours: 3,
            description: "",
            status: "active",
        },
    });

    const createCourse = api.admin.createCourse.useMutation({
        onSuccess: () => {
            toast.success("Course created successfully");
            form.reset();
            onSuccess?.();
            utils.admin.getAllCourses.invalidate();
        },
        onError: (error: any) => {
            toast.error("Failed to create course", {
                description: error.message,
            });
        },
    });

    function onSubmit(values: FormValues) {
        createCourse.mutate(values as any);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Course Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="CS101" {...field} className="uppercase" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="CS">Computer Science</SelectItem>
                                        <SelectItem value="SE">Software Engineering</SelectItem>
                                        <SelectItem value="EE">Electrical Engineering</SelectItem>
                                        <SelectItem value="MATH">Mathematics</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Course Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Introduction to Programming" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="semester"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Semester (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select semester" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                                        <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="creditHours"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Credit Hours</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Course content and objectives..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={createCourse.isPending}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={createCourse.isPending} className="flex-1 sm:flex-none min-w-[120px]">
                        {createCourse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {createCourse.isPending ? "Creating..." : "Create Course"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

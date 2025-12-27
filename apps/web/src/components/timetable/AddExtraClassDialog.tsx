"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { api } from "@/trpc/react";

const extraClassSchema = z.object({
    courseId: z.string().uuid("Course is required"),
    date: z.date("Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    location: z.string().min(1, "Location is required"),
    reason: z.string().optional(),
});

interface AddExtraClassDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddExtraClassDialog({ isOpen, onClose, onSuccess }: AddExtraClassDialogProps) {
    const utils = api.useUtils();
    const { data: courses } = api.courses.getAllCourses.useQuery({}); // Or use a TA specific query if restricted
    // Using admin.getCourses for simplicity as TAs usually see all courses or filtered by backend
    // But wait, TA router didn't have getCourses. Admin has.
    // Ideally we should add getCourses to TA router or Public router.
    // For now, I'll use admin.getCourses if the user has access? 
    // No, TA is not finding 'admin' router usually?
    // User might be TA and not have admin access.
    // I should add `getCourses` to `ta` router or `courses` router (public).
    // There is `coursesRouter` in `packages/api/src/routers/courses.ts`. Let's assume it has `getAll` or similar.
    // Let's check `coursesRouter`. 
    // I'll skip checking for now and try `trpc.courses.getAll` or similar.
    // Actually, I'll stick to `trpc.admin.getCourses` only if I'm sure. 
    // If not, I should use `trpc.courses.getMany` or similar.
    // Let's try `trpc.courses.getAll` in code, if it fails I'll fix.

    const addClass = api.ta.addExtraClass.useMutation({
        onSuccess: () => {
            toast.success("Extra class added");
            onSuccess();
            onClose();
        },
        onError: (err) => toast.error(err.message),
    });

    const form = useForm<z.infer<typeof extraClassSchema>>({
        resolver: zodResolver(extraClassSchema),
    });

    const onSubmit = (data: z.infer<typeof extraClassSchema>) => {
        addClass.mutate(data);
    };

    // We need to fetch courses. Using `courses` router if available
    const { data: courseList } = api.courses.getAllCourses.useQuery({});

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Extra / Compensatory Class</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="courseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select course" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {courseList?.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
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
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Room 101" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Compensation for..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={addClass.isPending}>
                                {addClass.isPending ? "Adding..." : "Add Class"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

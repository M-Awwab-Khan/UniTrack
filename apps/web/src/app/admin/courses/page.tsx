"use client";

import { useState } from "react";
import { CreateCourseForm } from "@/components/admin/courses/create-course-form";
import { CoursesTable } from "@/components/admin/courses/courses-table";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Key } from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminCoursesPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCourseCreated = () => {
        queryClient.invalidateQueries();
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                        Course Management
                    </h1>
                    <p className="text-muted-foreground">
                        Create and manage courses, assign departments, and track curriculum.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href={"/admin/courses/enrollment-codes" as any}>
                        <Button variant="outline" className="gap-2">
                            <Key className="h-4 w-4" />
                            Enrollment Codes
                        </Button>
                    </Link>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create New Course</DialogTitle>
                                <DialogDescription>
                                    Add a new course to the system. Fill in all the details below.
                                </DialogDescription>
                            </DialogHeader>
                            <CreateCourseForm
                                onSuccess={handleCourseCreated}
                                onCancel={() => setIsDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Existing Courses</h2>
                </div>
                <CoursesTable />
            </div>
        </div >
    );
}

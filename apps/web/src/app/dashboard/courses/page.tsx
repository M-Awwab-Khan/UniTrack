"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { Button } from "@/components/ui/button";
import { JoinCourseModal } from "@/components/dashboard/join-course-modal";
import { useTRPC } from "@/utils/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export default function MyCoursesPage() {
    const trpc = useTRPC();
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all"); // Type filter might need adjustment if schema doesn't match mock
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const { data: courses, isLoading } = useQuery(trpc.courses.getMyCourses.queryOptions());

    const filteredCourses = (courses || []).filter((course) => {
        const matchesSearch =
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase());

        // Role/Type Logic might simpler now since we just fetch "My Courses".
        // Assuming roles/types are properties of the course or enrollment.
        // For now, simpler filtering:
        // const matchesRole = roleFilter === "all" || course.role === roleFilter; 

        return matchesSearch;
    });

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                    <p className="text-muted-foreground">
                        Manage your enrolled courses, track progress, and stay updated with deadlines.
                    </p>
                </div>
                <Button onClick={() => setIsJoinModalOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Join Course
                </Button>
            </div>

            <CourseFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
            />

            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-[280px] rounded-xl" />
                    ))}
                </div>
            ) : filteredCourses.length > 0 ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
                >
                    {filteredCourses.map((course: any) => (
                        // Adapting data to CourseCard props requirements
                        <CourseCard
                            key={course.courseId}
                            course={{
                                id: course.courseId,
                                name: course.name,
                                code: course.code,
                                term: course.semester || "Spring 2025",
                                instructor: "TBA",
                                upcomingDeadlines: course.activeAssignments || 0,
                                classActivity: {
                                    conducted: 0,
                                    cancelled: 0,
                                    compensatory: 0,
                                },
                                progress: 0,
                                hasAnnouncement: false,
                                color: "bg-blue-500",
                                role: "Student",
                                type: "Theory"
                            }}
                        />
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/20"
                >
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        You haven't joined any courses yet. Click "Join Course" to get started with an enrollment code.
                    </p>
                    <Button onClick={() => setIsJoinModalOpen(true)}>
                        Join Course
                    </Button>
                </motion.div>
            )}

            <JoinCourseModal
                open={isJoinModalOpen}
                onOpenChange={setIsJoinModalOpen}
            />
        </div>
    );
}


"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { COURSES } from "@/components/courses/mock-data";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { Button } from "@/components/ui/button";

export default function MyCoursesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const filteredCourses = COURSES.filter((course) => {
        const matchesSearch =
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === "all" || course.role === roleFilter;
        const matchesType = typeFilter === "all" || course.type === typeFilter;

        return matchesSearch && matchesRole && matchesType;
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
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                <p className="text-muted-foreground">
                    Manage your enrolled courses, track progress, and stay updated with deadlines.
                </p>
            </div>

            <CourseFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
            />

            {filteredCourses.length > 0 ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
                >
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
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
                        We couldn't find any courses matching your filters. Try adjusting your search query or filters.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery("");
                            setRoleFilter("all");
                            setTypeFilter("all");
                        }}
                    >
                        Clear Filters
                    </Button>
                </motion.div>
            )}
        </div>
    );
}

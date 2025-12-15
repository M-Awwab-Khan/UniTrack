
"use client";

import { Badge } from "@/components/ui/badge";
import type { Course } from "@/components/courses/mock-data";

interface CourseHeaderProps {
    course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
    return (
        <div className="relative mb-8 rounded-xl bg-card p-6 border shadow-sm overflow-hidden">
            {/* Accent Gradient Background */}
            <div
                className="absolute top-0 left-0 w-full h-1.5 opacity-100"
                style={{ backgroundColor: 'currentColor' }}
            >
                <div className={`w-full h-full ${course.color.replace('bg-', 'bg-')}`} />
            </div>
            {/* Soft background tint */}
            <div className={`absolute inset-0 opacity-[0.03] ${course.color}`} />

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                            {course.code}
                        </Badge>
                        <Badge variant="secondary" className="bg-background/50 backdrop-blur-sm">
                            {course.term}
                        </Badge>
                        {course.role === 'TA' && (
                            <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                                Teaching Assistant
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{course.name}</h1>
                    <p className="text-muted-foreground mt-1 text-lg flex items-center gap-2">
                        {course.instructor}
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-sm text-muted-foreground">Class Average</div>
                        <div className="font-semibold">B+ (87%)</div>
                    </div>
                    <div className="w-px h-10 bg-border hidden md:block mx-2" />
                    <div className="text-right hidden md:block">
                        <div className="text-sm text-muted-foreground">My Grade</div>
                        <div className="font-semibold text-primary">A- (91%)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

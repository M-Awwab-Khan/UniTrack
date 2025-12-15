
"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    CalendarClock,
    Beaker,
    GraduationCap,
    Megaphone,
    UserCircle,
    MoreVertical
} from "lucide-react";
import type { Course } from "./mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
    course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden relative group">
                {/* Accent Line */}
                <div className={cn("h-1.5 w-full absolute top-0 left-0", course.color)} />

                <CardHeader className="pb-3 pt-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                                <span className="bg-muted px-2 py-0.5 rounded-md">{course.code}</span>
                                <Badge variant={course.role === "TA" ? "destructive" : "secondary"} className="text-[10px] px-1.5 h-5">
                                    {course.role}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 h-5 flex gap-1 items-center">
                                    {course.type === "Lab" ? <Beaker className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                                    {course.type}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg font-bold leading-tight line-clamp-2 min-h-[3.5rem] flex items-center">
                                {course.name}
                            </CardTitle>
                        </div>
                        {course.hasAnnouncement && (
                            <div className="relative">
                                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                                </span>
                                <div className="p-1.5 bg-sky-50 text-sky-600 rounded-full">
                                    <Megaphone className="w-4 h-4" />
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Instructor */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserCircle className="w-4 h-4" />
                        <span>{course.instructor}</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 py-2">
                        <div className={cn(
                            "flex items-center gap-2 p-2 rounded-lg border",
                            course.upcomingDeadlines > 0 ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-muted/30 border-transparent text-muted-foreground"
                        )}>
                            <CalendarClock className="w-4 h-4" />
                            <div className="text-xs">
                                <span className="font-semibold block">{course.upcomingDeadlines}</span>
                                <span>Deadlines</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-transparent text-muted-foreground">
                            <GraduationCap className="w-4 h-4" />
                            <div className="text-xs">
                                <span className="font-semibold block">{course.classActivity.conducted}</span>
                                <span>Classes</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Semester Progress</span>
                            <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-1.5" indicatorClassName={course.color} />
                    </div>
                </CardContent>

                <CardFooter className="pt-2">
                    <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground hover:text-primary">
                        View Course Details
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

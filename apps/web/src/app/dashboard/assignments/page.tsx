
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GLOBAL_ASSIGNMENTS, type GlobalAssignment } from "@/components/assignments/mock-data";
import { AssignmentFilters } from "@/components/assignments/assignment-filters";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentDetailsDialog } from "@/components/assignments/assignment-details-dialog";
import { Button } from "@/components/ui/button";
import { CalendarCheck, LayoutList, LayoutGrid } from "lucide-react";

export default function GlobalAssignmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [courseFilter, setCourseFilter] = useState("all");

    const courses = Array.from(new Set(GLOBAL_ASSIGNMENTS.map(a => a.courseName)));

    const filteredAssignments = GLOBAL_ASSIGNMENTS.filter((assignment) => {
        const matchesSearch =
            assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "All" || assignment.status === statusFilter;
        const matchesCourse = courseFilter === "all" || assignment.courseName === courseFilter;

        return matchesSearch && matchesStatus && matchesCourse;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Grouping logic (simplified for Today/This Week/Later)
    // For this demo, we'll just render the list flat or could implement sections if needed.
    // The plan specified "Group by: Today, This Week, Later".

    const groupAssignments = (assignments: GlobalAssignment[]) => {
        const today = new Date();
        const grouped = {
            "Overdue": [] as GlobalAssignment[],
            "Due Today": [] as GlobalAssignment[],
            "This Week": [] as GlobalAssignment[],
            "Later": [] as GlobalAssignment[],
            "Completed": [] as GlobalAssignment[]
        };

        assignments.forEach(assignment => {
            if (assignment.status === 'Completed') {
                grouped["Completed"].push(assignment);
                return;
            }
            if (assignment.status === 'Overdue') {
                grouped["Overdue"].push(assignment);
                return;
            }

            const dueDate = new Date(assignment.dueDate);
            const isToday = dueDate.toDateString() === today.toDateString();
            const diffDays = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

            if (isToday) {
                grouped["Due Today"].push(assignment);
            } else if (diffDays <= 7 && diffDays > 0) {
                grouped["This Week"].push(assignment);
            } else {
                grouped["Later"].push(assignment);
            }
        });

        return grouped;
    };

    const grouped = groupAssignments(filteredAssignments);
    const showGroups = searchQuery === "" && courseFilter === "all" && statusFilter === "All";

    // Modal State
    const [selectedAssignment, setSelectedAssignment] = useState<GlobalAssignment | null>(null);

    return (
        <div className="w-full max-w-5xl mx-auto pb-10 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground mt-1">
                        All your assignments across courses, in one place.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <LayoutList className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <AssignmentFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                courses={courses}
            />

            <div className="space-y-8">
                {filteredAssignments.length > 0 ? (
                    showGroups ? (
                        Object.entries(grouped).map(([group, assignments]) => (
                            assignments.length > 0 && (
                                <motion.section
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={group}
                                    className="space-y-3"
                                >
                                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">{group}</h2>
                                    <div className="space-y-3">
                                        {assignments.map(assignment => (
                                            <AssignmentCard
                                                key={assignment.id}
                                                assignment={assignment}
                                                onClick={() => setSelectedAssignment(assignment)}
                                            />
                                        ))}
                                    </div>
                                </motion.section>
                            )
                        ))
                    ) : (
                        <div className="space-y-3">
                            {filteredAssignments.map(assignment => (
                                <AssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    onClick={() => setSelectedAssignment(assignment)}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/20"
                    >
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <CalendarCheck className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">You're all caught up! 🎉</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            No assignments found matching your current filters.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("All");
                                setCourseFilter("all");
                            }}
                        >
                            Clear Filters
                        </Button>
                    </motion.div>
                )}
            </div>

            <AssignmentDetailsDialog
                isOpen={!!selectedAssignment}
                onClose={() => setSelectedAssignment(null)}
                assignment={selectedAssignment}
            />
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { Search, Filter, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AssignmentDetailsDialog } from "@/components/assignments/assignment-details-dialog";
import { useQueryState } from "nuqs";

interface AssignmentsTabProps {
    courseId: string;
}

export function AssignmentsTab({ courseId }: AssignmentsTabProps) {
    const { data: assignments, isLoading } = api.assignments.getByCourseId.useQuery({ courseId });
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const router = useRouter();
    const [openParam, setOpenParam] = useQueryState("open");
    const [idParam, setIdParam] = useQueryState("id");
    const pathname = usePathname();

    const selectedId = idParam;
    const isDetailsOpen = openParam === 'details';

    // Find selected assignment
    const selectedAssignment = assignments?.find(a => a.id === selectedId);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-4 mb-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-32" />
                </div>
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
        );
    }

    const filteredAssignments = assignments?.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];

    const handleAssignmentClick = (id: string) => {
        setOpenParam("details");
        setIdParam(id);
    };

    const handleCloseModal = () => {
        setOpenParam(null);
        setIdParam(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assignments..."
                        className="pl-9 bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-card">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Assignments</SelectItem>
                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                            <SelectItem value="Due Today">Due Today</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="bg-card">
                        <SortAsc className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment as any}
                            onClick={() => handleAssignmentClick(assignment.id)}
                        // onSubmit={() => handleAssignmentClick(assignment.id)} // Open details for submit too
                        />
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        {searchQuery ? "No assignments match your search" : "No assignments found for this course"}
                    </div>
                )}
            </div>

            <AssignmentDetailsDialog
                isOpen={isDetailsOpen}
                onClose={() => handleCloseModal()}
                assignment={selectedAssignment as any}
            />
        </motion.div>
    );
}

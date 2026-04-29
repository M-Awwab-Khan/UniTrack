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
import { AssignmentDetailsDialog } from "@/components/assignments/assignment-details-dialog";
import { useQueryState } from "nuqs";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { CreateAssignmentModal } from "@/components/assignments/create-assignment-modal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AssignmentsTabProps {
    courseId: string;
}

export function AssignmentsTab({ courseId }: AssignmentsTabProps) {
    type AssignmentItem = {
        id: string;
        title: string;
        description: string;
        courseId: string;
        type: "Lab" | "Assignment" | "Quiz" | "Project" | "Presentation";
        dueDate: string;
        instructions?: string | null;
        attachments?: {
            id: string;
            type: "file" | "link";
            name: string;
            url: string;
            fileSize?: number;
            mimeType?: string;
        }[];
    };

    const utils = api.useUtils();
    const { data: assignments, isLoading } = api.assignments.getByCourseId.useQuery({ courseId });
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AssignmentItem | null>(null);
    const [openParam, setOpenParam] = useQueryState("open");
    const [idParam, setIdParam] = useQueryState("id");
    const { data: session } = authClient.useSession();
    const isTA = session?.user?.role === "ta";

    const deleteMutation = api.assignments.delete.useMutation({
        onSuccess: () => {
            toast.success("Assignment deleted");
            setDeleteTarget(null);
            utils.assignments.getByCourseId.invalidate({ courseId });
            utils.assignments.getAll.invalidate();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to delete assignment");
        },
    });

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

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate({ id: deleteTarget.id });
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
                            canEdit={isTA}
                            onEdit={() => {
                                setEditingAssignment(assignment as AssignmentItem);
                                setCreateModalOpen(true);
                            }}
                            onDelete={() => setDeleteTarget(assignment as AssignmentItem)}
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

            {isTA && (
                <CreateAssignmentModal
                    open={createModalOpen}
                    onOpenChange={(open) => {
                        setCreateModalOpen(open);
                        if (!open) {
                            setEditingAssignment(null);
                        }
                    }}
                    mode={editingAssignment ? "edit" : "create"}
                    initialData={editingAssignment}
                    onSuccess={() => {
                        setEditingAssignment(null);
                        utils.assignments.getByCourseId.invalidate({ courseId });
                        utils.assignments.getAll.invalidate();
                    }}
                />
            )}

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-semibold text-foreground">{deleteTarget?.title}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleteMutation.isPending}
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete Assignment"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}

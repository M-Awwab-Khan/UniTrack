"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AssignmentFilters } from "@/components/assignments/assignment-filters";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentDetailsDialog } from "@/components/assignments/assignment-details-dialog";
import { Button } from "@/components/ui/button";
import { CalendarCheck, LayoutList, LayoutGrid, Plus, Loader2 } from "lucide-react";
import { type GlobalAssignment } from "@/components/assignments/mock-data";
import { CreateAssignmentModal } from "@/components/assignments/create-assignment-modal";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useQueryState } from 'nuqs'
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

export default function GlobalAssignmentsPage() {
    type AssignmentItem = GlobalAssignment & {
        courseId?: string;
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
    const router = useRouter();
    const [openParam] = useQueryState("open");
    const [idParam] = useQueryState("id");


    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [courseFilter, setCourseFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AssignmentItem | null>(null);

    // Auth & Permissions
    const { data: session } = authClient.useSession();
    const isTA = session?.user?.role === "ta";

    // Data Fetching
    const { data: assignmentsData, isLoading } = api.assignments.getAll.useQuery();

    // Mutations
    const deleteMutation = api.assignments.delete.useMutation({
        onSuccess: () => {
            toast.success("Assignment deleted");
            utils.assignments.getAll.invalidate();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to delete");
        }
    });

    const assignments: AssignmentItem[] = assignmentsData ? assignmentsData.map(a => ({
        ...a,
        courseColor: "bg-blue-500", // Fallback color logic could be improved
    } as any)) : []; // Cast to match GlobalAssignment for now which has mock specific fields

    const courses = Array.from(new Set(assignments.map(a => a.courseName)));

    const filteredAssignments = assignments.filter((assignment) => {
        const matchesSearch =
            assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "All" || assignment.status === statusFilter;
        const matchesCourse = courseFilter === "all" || assignment.courseName === courseFilter;

        return matchesSearch && matchesStatus && matchesCourse;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Grouping logic (simplified)
    const groupedAssignments = () => {
        const today = new Date();
        const grouped = {
            "Overdue": [] as GlobalAssignment[],
            "Due Today": [] as GlobalAssignment[],
            "This Week": [] as GlobalAssignment[],
            "Later": [] as GlobalAssignment[],
            "Completed": [] as GlobalAssignment[]
        };

        filteredAssignments.forEach(assignment => {
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

    const grouped = groupedAssignments();
    const showGroups = searchQuery === "" && courseFilter === "all" && statusFilter === "All";

    // Derived Selection from URL
    const selectedAssignment = (openParam === "details" && idParam && assignments.length > 0)
        ? assignments.find(a => a.id === idParam) || null
        : null;

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate({ id: deleteTarget.id }, {
            onSuccess: () => {
                setDeleteTarget(null);
            }
        });
    };

    const handleEdit = (assignment: AssignmentItem) => {
        setEditingAssignment(assignment);
        setCreateModalOpen(true);
    };

    const handleAssignmentClick = (assignment: GlobalAssignment) => {
        router.push(`/dashboard/assignments?open=details&id=${assignment.id}`);
    };

    const handleCloseModal = () => {
        router.replace("/dashboard/assignments");
    };

    return (
        <div className="w-full max-w-5xl mx-auto pb-10 space-y-6 relative min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground mt-1">
                        All your assignments across courses, in one place.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setViewMode("list")}
                    >
                        <LayoutList className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setViewMode("grid")}
                    >
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

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading assignments...</p>
                </div>
            ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-8"}>
                    {filteredAssignments.length > 0 ? (
                        showGroups && viewMode === "list" ? (
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
                                                    onClick={() => handleAssignmentClick(assignment)}
                                                    canEdit={isTA}
                                                    onEdit={() => handleEdit(assignment)}
                                                    onDelete={() => setDeleteTarget(assignment)}
                                                />
                                            ))}
                                        </div>
                                    </motion.section>
                                )
                            ))
                        ) : (
                            <div className={viewMode === "list" ? "space-y-3" : "contents"}>
                                {filteredAssignments.map(assignment => (
                                    <AssignmentCard
                                        key={assignment.id}
                                        assignment={assignment}
                                        onClick={() => handleAssignmentClick(assignment)}
                                        canEdit={isTA}
                                        onEdit={() => handleEdit(assignment)}
                                        onDelete={() => setDeleteTarget(assignment)}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/20 col-span-full"
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
            )}

            <AssignmentDetailsDialog
                isOpen={!!selectedAssignment}
                onClose={handleCloseModal}
                assignment={selectedAssignment}
                canEdit={isTA}
            />

            {/* TA Controls - Floating Action Button */}
            {isTA && (
                <div className="fixed bottom-8 right-8 z-50">
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            )}

            <CreateAssignmentModal
                open={createModalOpen}
                onOpenChange={(open) => {
                    setCreateModalOpen(open);
                    if (!open) {
                        setEditingAssignment(null);
                    }
                }}
                mode={editingAssignment ? "edit" : "create"}
                initialData={editingAssignment ? {
                    id: editingAssignment.id,
                    title: editingAssignment.title,
                    description: editingAssignment.description,
                    courseId: editingAssignment.courseId ?? "",
                    type: editingAssignment.type as "Lab" | "Assignment" | "Quiz" | "Project" | "Presentation",
                    dueDate: editingAssignment.dueDate,
                    instructions: editingAssignment.instructions,
                    attachments: editingAssignment.attachments,
                } : null}
                onSuccess={() => {
                    setEditingAssignment(null);
                }}
            />

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
        </div>
    );
}

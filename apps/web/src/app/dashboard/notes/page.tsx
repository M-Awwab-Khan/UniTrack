"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GLOBAL_NOTES, type GlobalNote } from "@/components/notes/mock-data";
import { NoteFilters } from "@/components/notes/note-filters";
import { NoteCard } from "@/components/notes/note-card";
import { NotePreviewDialog } from "@/components/notes/note-preview-dialog";
import { BookOpen, FolderOpen, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateNoteModal } from "@/components/notes/create-note-modal";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { api } from "@/trpc/react";

import { useRouter } from "next/navigation";
import { useQueryState } from 'nuqs'

export default function NotesPage() {
    const utils = api.useUtils();
    const router = useRouter();
    const [openParam, setOpenParam] = useQueryState("open");
    const [idParam, setIdParam] = useQueryState("id");

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [courseFilter, setCourseFilter] = useState("all");
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Auth & Permissions
    const { data: session } = authClient.useSession();
    const isTA = session?.user?.role === "ta";

    // Data Fetching
    const { data: notesData, isLoading } = api.notes.getAll.useQuery();

    // Mutations
    const deleteMutation = api.notes.delete.useMutation({
        onSuccess: () => {
            toast.success("Note deleted");
            utils.notes.getAll.invalidate();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to delete");
        }
    });

    const notes: GlobalNote[] = notesData ? notesData.map(n => ({
        ...n,
        courseColor: "bg-blue-500", // Placeholder
        uploadDate: n.uploadDate, // Ensure ISO string
        fileSize: "N/A" // Placeholder
    } as any)) : [];

    const courses = Array.from(new Set(notes.map(n => n.courseName)));

    const filteredNotes = notes.filter((note) => {
        const matchesSearch =
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            note.courseName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === "All" || note.type === typeFilter;
        const matchesCourse = courseFilter === "all" || note.courseName === courseFilter;

        return matchesSearch && matchesType && matchesCourse;
    }).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    // Derived Selection
    const selectedNote = (openParam === "preview" && idParam && notes.length > 0)
        ? notes.find(n => n.id === idParam) || null
        : null;

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this note?")) {
            deleteMutation.mutate({ id });
        }
    }

    const handleNoteClick = (note: GlobalNote) => {
        router.push(`/dashboard/notes?open=preview&id=${note.id}`);
    }

    const handleCloseModal = () => {
        router.replace("/dashboard/notes");
    }

    return (
        <div className="w-full max-w-6xl mx-auto pb-10 space-y-6 relative min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        All your course materials, organized in one place.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                        <FolderOpen className="w-4 h-4" />
                        Go to Drive
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <NoteFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                courses={courses}
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading notes...</p>
                </div>
            ) : (
                /* Notes Grid */
                <div className="min-h-[400px]">
                    {filteredNotes.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredNotes.map((note) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onClick={() => handleNoteClick(note)}
                                        canEdit={isTA}
                                        onEdit={() => toast.info("Edit not implemented yet")}
                                        onDelete={() => handleDelete(note.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/20"
                        >
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <BookOpen className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No notes found</h3>
                            <p className="text-muted-foreground max-w-sm mb-6">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setTypeFilter("All");
                                    setCourseFilter("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Preview Dialog */}
            <NotePreviewDialog
                isOpen={!!selectedNote}
                onClose={handleCloseModal}
                note={selectedNote}
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

            <CreateNoteModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />
        </div>
    );
}

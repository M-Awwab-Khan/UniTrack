
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GLOBAL_NOTES, type GlobalNote } from "@/components/notes/mock-data";
import { NoteFilters } from "@/components/notes/note-filters";
import { NoteCard } from "@/components/notes/note-card";
import { NotePreviewDialog } from "@/components/notes/note-preview-dialog";
import { BookOpen, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [courseFilter, setCourseFilter] = useState("all");
    const [selectedNote, setSelectedNote] = useState<GlobalNote | null>(null);

    const courses = Array.from(new Set(GLOBAL_NOTES.map(n => n.courseName)));

    const filteredNotes = GLOBAL_NOTES.filter((note) => {
        const matchesSearch =
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            note.courseName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === "All" || note.type === typeFilter;
        const matchesCourse = courseFilter === "all" || note.courseName === courseFilter;

        return matchesSearch && matchesType && matchesCourse;
    }).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    return (
        <div className="w-full max-w-6xl mx-auto pb-10 space-y-6">
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

            {/* Notes Grid */}
            <div className="min-h-[400px]">
                {filteredNotes.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onClick={() => setSelectedNote(note)}
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

            {/* Preview Dialog */}
            <NotePreviewDialog
                isOpen={!!selectedNote}
                onClose={() => setSelectedNote(null)}
                note={selectedNote}
            />
        </div>
    );
}


"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GLOBAL_ANNOUNCEMENTS, type GlobalAnnouncement } from "@/components/announcements/mock-data";
import { AnnouncementFilters } from "@/components/announcements/announcement-filters";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { AnnouncementDetailDialog } from "@/components/announcements/announcement-detail-dialog";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnnouncementsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [courseFilter, setCourseFilter] = useState("all");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<GlobalAnnouncement | null>(null);

    const courses = Array.from(new Set(GLOBAL_ANNOUNCEMENTS.map(a => a.courseName)));

    const filteredAnnouncements = GLOBAL_ANNOUNCEMENTS.filter((announcement) => {
        const matchesSearch =
            announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            announcement.courseName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPriority = priorityFilter === "All" || announcement.priority === priorityFilter;
        const matchesCourse = courseFilter === "all" || announcement.courseName === courseFilter;

        return matchesSearch && matchesPriority && matchesCourse;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

    return (
        <div className="w-full max-w-4xl mx-auto pb-10 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        All updates from your courses in one place.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                        <Bell className="w-4 h-4" />
                        Notification Settings
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <AnnouncementFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                courses={courses}
            />

            {/* Announcements List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredAnnouncements.length > 0 ? (
                        filteredAnnouncements.map((announcement) => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onClick={() => setSelectedAnnouncement(announcement)}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/20"
                        >
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <BellOff className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">You're all caught up!</h3>
                            <p className="text-muted-foreground max-w-sm mb-6">
                                No announcements found matching your current filters.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setPriorityFilter("All");
                                    setCourseFilter("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Detail Dialog */}
            <AnnouncementDetailDialog
                isOpen={!!selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
                announcement={selectedAnnouncement}
            />
        </div>
    );
}

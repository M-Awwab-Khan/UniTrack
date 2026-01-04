"use client";

import { motion } from "framer-motion";
import { Search, Megaphone, Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnnouncementDetailDialog } from "@/components/announcements/announcement-detail-dialog";
import { useQueryState } from "nuqs";

interface AnnouncementsTabProps {
    courseId: string;
}

export function AnnouncementsTab({ courseId }: AnnouncementsTabProps) {
    const { data: announcements, isLoading } = api.announcements.getByCourseId.useQuery({ courseId });
    const [searchQuery, setSearchQuery] = useState("");

    const [openParam, setOpenParam] = useQueryState("open");
    const [idParam, setIdParam] = useQueryState("id");

    const selectedId = idParam;
    const isDetailsOpen = openParam === 'details';

    // Find selected announcement
    const selectedAnnouncement = announcements?.find(a => a.id === selectedId);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
        );
    }

    const filteredAnnouncements = announcements?.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleAnnouncementClick = (id: string) => {
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
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search announcements..."
                    className="pl-9 bg-card"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Main Content */}
            <div className="space-y-4">
                {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((announcement) => (
                        <Card
                            key={announcement.id}
                            className="hover:border-primary/50 transition-all cursor-pointer group"
                            onClick={() => handleAnnouncementClick(announcement.id)}
                        >
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {announcement.isImportant && (
                                                <Pin className="w-4 h-4 text-primary rotate-45" />
                                            )}
                                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                {announcement.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Badge variant="secondary" className="h-5 px-1.5 font-normal">
                                                {announcement.role || "Instructor"}
                                            </Badge>
                                            <span>•</span>
                                            <span>{announcement.author}</span>
                                            <span>•</span>
                                            <span>{format(new Date(announcement.date), "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                    {announcement.isImportant && (
                                        <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                                            Important
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 pl-6 md:pl-0 border-l-2 border-transparent md:border-l-0 border-l-muted-foreground/20">
                                    {announcement.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg">
                        <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>{searchQuery ? "No announcements match your search" : "No announcements posted yet"}</p>
                    </div>
                )}
            </div>

            <AnnouncementDetailDialog
                isOpen={isDetailsOpen}
                onClose={() => handleCloseModal()}
                announcement={selectedAnnouncement as any}
            />
        </motion.div>
    );
}

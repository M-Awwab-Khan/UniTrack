
"use client";

import { motion } from "framer-motion";
import type { CourseDetail } from "@/components/courses/mock-course-details";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Pin } from "lucide-react";

interface AnnouncementsTabProps {
    data: CourseDetail;
}

export function AnnouncementsTab({ data }: AnnouncementsTabProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            {data.announcements.map((announcement) => (
                <Card key={announcement.id} className="overflow-hidden">
                    <div className="px-4 space-y-2">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${announcement.author}`} />
                                    <AvatarFallback>{announcement.author[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-sm flex items-center gap-2">
                                        {announcement.author}
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{announcement.role}</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(new Date(announcement.date), "MMM d, yyyy • h:mm a")}
                                    </div>
                                </div>
                            </div>
                            {announcement.isImportant && (
                                <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    <Pin className="w-3 h-3" />
                                    Pinned
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pl-[52px]">
                            <h3 className="font-bold text-lg">{announcement.title}</h3>
                            <div className="prose prose-sm text-muted-foreground max-w-none">
                                <p>{announcement.content}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </motion.div>
    );
}

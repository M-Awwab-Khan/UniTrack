
"use client";

import { motion } from "framer-motion";
import type { CourseDetail } from "@/components/courses/mock-course-details";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, Download, ExternalLink, Video } from "lucide-react";
import { format } from "date-fns";

interface NotesTabProps {
    data: CourseDetail;
}

export function NotesTab({ data }: NotesTabProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
            case 'Link': return <LinkIcon className="w-5 h-5 text-blue-500" />;
            case 'Video': return <Video className="w-5 h-5 text-purple-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    // Group by category
    const groupedResources = data.resources.reduce((acc, resource) => {
        const category = resource.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(resource);
        return acc;
    }, {} as Record<string, typeof data.resources>);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {Object.entries(groupedResources).map(([category, resources]) => (
                <div key={category} className="space-y-3">
                    <h3 className="font-semibold text-lg px-1">{category}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.map((resource) => (
                            <Card key={resource.id} className="hover:shadow-md transition-all group cursor-pointer border-transparent hover:border-border bg-muted/30 hover:bg-card">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <div className="p-2 bg-background rounded-md shadow-sm group-hover:shadow transition-all">
                                        {getIcon(resource.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                                            {resource.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{resource.type}</span>
                                            <span>•</span>
                                            <span>{format(new Date(resource.uploadDate), "MMM d")}</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                        {resource.type === 'Link' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, Download, ExternalLink, Video } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { NotePreviewDialog } from "@/components/notes/note-preview-dialog";

interface NotesTabProps {
    courseId: string;
}

export function NotesTab({ courseId }: NotesTabProps) {
    const { data: resources, isLoading } = api.notes.getByCourseId.useQuery({ courseId });
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const selectedId = searchParams.get('id');
    const isPreviewOpen = searchParams.get('open') === 'preview';

    // Note: NotePreviewDialog expects `note` object.
    const selectedResource = resources?.find(r => r.id === selectedId);

    const mappedNote = selectedResource ? {
        id: selectedResource.id,
        title: selectedResource.title,
        courseName: (selectedResource as any).courseName,
        courseCode: (selectedResource as any).courseCode,
        courseColor: (selectedResource as any).courseColor,
        type: selectedResource.type === 'PDF' ? "Lecture Note" : "Reading",
        uploadDate: selectedResource.uploadDate,
        uploadedBy: (selectedResource as any).uploadedBy,
        description: (selectedResource as any).description || "",
        attachments: [{
            id: selectedResource.id,
            name: selectedResource.title,
            url: selectedResource.url,
            type: selectedResource.type === 'PDF' ? 'file' : 'link',
            mimeType: 'application/pdf',
            fileSize: 0,
        }],
    } : null;

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-6 w-32" />
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, j) => <Skeleton key={j} className="h-24" />)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Group by category
    const groupedResources = (resources || []).reduce((acc, resource) => {
        const category = resource.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(resource);
        return acc;
    }, {} as Record<string, typeof resources>);

    const getIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (t.includes('link')) return <LinkIcon className="w-5 h-5 text-blue-500" />;
        if (t.includes('video')) return <Video className="w-5 h-5 text-purple-500" />;
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    const handleNoteClick = (resource: any) => {
        const params = new URLSearchParams(searchParams);
        params.set('open', 'preview');
        params.set('id', resource.id);
        router.push(`${pathname}?${params.toString()}` as any);
    };

    const handleCloseModal = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('open');
        params.delete('id');
        router.push(`${pathname}?${params.toString()}` as any);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {Object.keys(groupedResources).length > 0 ? (
                Object.entries(groupedResources).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                        <h3 className="font-semibold text-lg px-1">{category}</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items?.map((resource) => (
                                <Card key={resource.id} className="hover:shadow-md transition-all group cursor-pointer border-transparent hover:border-border bg-muted/30 hover:bg-card" onClick={() => handleNoteClick(resource)}>
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <div className="p-2 bg-background rounded-md shadow-sm group-hover:shadow transition-all">
                                            {getIcon(resource.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
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
                ))
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    No resources available
                </div>
            )}

            {/* Note Preview Modal */}
            <NotePreviewDialog
                isOpen={isPreviewOpen}
                onClose={() => handleCloseModal()}
                note={mappedNote as any}
            />
        </motion.div>
    );
}

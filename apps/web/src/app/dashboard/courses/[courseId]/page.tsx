
"use client";



import { useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { CourseHeader } from "@/components/courses/course-detail/course-header";
import { TabsNav, type TabId } from "@/components/courses/course-detail/tabs-nav";
import { OverviewTab } from "@/components/courses/course-detail/overview-tab";
import { AssignmentsTab } from "@/components/courses/course-detail/assignments-tab";
import { AnnouncementsTab } from "@/components/courses/course-detail/announcements-tab";
import { NotesTab } from "@/components/courses/course-detail/notes-tab";
import { TimetableTab } from "@/components/courses/course-detail/timetable-tab";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.courseId as string;

    const { data: course, isLoading } = api.courses.getById.useQuery({ id: courseId });

    const [activeTab, setActiveTab] = useState<TabId>("overview");

    if (isLoading) {
        return <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
        </div>;
    }

    if (!course) {
        return <div className="p-8 text-center text-muted-foreground">Course not found</div>;
    }

    // Map backend response to CourseHeader expected prop (temporary adapter or update component)
    const headerData = {
        ...course,
        term: course.semester || "N/A",
        role: "Student", // Defaulting for now
        progress: 0, // Placeholder
        nextAssignment: undefined,
        description: course.description || "",
    } as any;

    return (
        <div className="w-full max-w-5xl mx-auto pb-10">
            <CourseHeader course={headerData} />

            <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && <OverviewTab key="overview" courseId={courseId} setTab={setActiveTab} />}
                    {activeTab === 'assignments' && <AssignmentsTab key="assignments" courseId={courseId} />}
                    {activeTab === 'announcements' && <AnnouncementsTab key="announcements" courseId={courseId} />}
                    {activeTab === 'notes' && <NotesTab key="notes" courseId={courseId} />}
                    {activeTab === 'timetable' && <TimetableTab key="timetable" courseId={courseId} />}
                </AnimatePresence>
            </div>
        </div>
    );
}

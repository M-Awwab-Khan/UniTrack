
"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { COURSES } from "@/components/courses/mock-data";
import { MOCK_COURSE_DETAILS } from "@/components/courses/mock-course-details";
import { CourseHeader } from "@/components/courses/course-detail/course-header";
import { TabsNav, type TabId } from "@/components/courses/course-detail/tabs-nav";
import { OverviewTab } from "@/components/courses/course-detail/overview-tab";
import { AssignmentsTab } from "@/components/courses/course-detail/assignments-tab";
import { AnnouncementsTab } from "@/components/courses/course-detail/announcements-tab";
import { NotesTab } from "@/components/courses/course-detail/notes-tab";
import { TimetableTab } from "@/components/courses/course-detail/timetable-tab";

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.courseId as string;

    // In a real app, verify existing course first, or fetch both
    const courseBasic = COURSES.find(c => c.id === courseId);
    const courseDetail = MOCK_COURSE_DETAILS[courseId];

    // If mocking only one course, fallback to it for demo purposes if ID matches logic or just use '1'
    // For this demo, let's strictly check or default to the first one available
    const displayCourse = courseBasic || COURSES[0];
    const displayDetail = courseDetail || MOCK_COURSE_DETAILS['1'];

    const [activeTab, setActiveTab] = useState<TabId>("overview");

    if (!displayCourse || !displayDetail) {
        return <div className="p-8">Course not found</div>;
    }

    return (
        <div className="w-full max-w-5xl mx-auto pb-10">
            <CourseHeader course={displayCourse} />

            <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && <OverviewTab key="overview" data={displayDetail} setTab={setActiveTab} />}
                    {activeTab === 'assignments' && <AssignmentsTab key="assignments" data={displayDetail} />}
                    {activeTab === 'announcements' && <AnnouncementsTab key="announcements" data={displayDetail} />}
                    {activeTab === 'notes' && <NotesTab key="notes" data={displayDetail} />}
                    {activeTab === 'timetable' && <TimetableTab key="timetable" data={displayDetail} />}
                </AnimatePresence>
            </div>
        </div>
    );
}

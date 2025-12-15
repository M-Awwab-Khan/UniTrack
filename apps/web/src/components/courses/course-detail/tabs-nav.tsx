
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TABS = [
    { id: "overview", label: "Overview" },
    { id: "assignments", label: "Assignments" },
    { id: "announcements", label: "Announcements" },
    { id: "notes", label: "Notes" },
    { id: "timetable", label: "Timetable" },
] as const;

export type TabId = typeof TABS[number]["id"];

interface TabsNavProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

export function TabsNav({ activeTab, setActiveTab }: TabsNavProps) {
    return (
        <div className="border-b mb-6 overflow-x-auto">
            <div className="flex gap-6 min-w-max px-1">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative pb-3 text-sm font-medium transition-colors hover:text-primary",
                            activeTab === tab.id
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

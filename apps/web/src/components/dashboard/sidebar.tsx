"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    CalendarDays,
    Clock,
    Bell,
    Notebook,
    GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";

import type { UrlObject } from "url";

interface SidebarItem {
    icon: any;
    label: string;
    href: string; // The error persists with just string, sometimes RouteImpl is tricky. 
    // Usually standard string works. The issue might be next version specific.
    // Let's rely on casting in the usage or try Route type if available.
}

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "My Courses", href: "/dashboard/courses" },
    { icon: CalendarDays, label: "Assignments", href: "/dashboard/assignments" },
    { icon: Clock, label: "Timetable", href: "/dashboard/timetable" },
    { icon: Bell, label: "Announcements", href: "/dashboard/announcements" },
    { icon: Notebook, label: "Notes", href: "/dashboard/notes" },
] as const;

interface DashboardSidebarProps {
    className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn("border-r bg-muted/40 md:block w-64 min-h-screen sticky top-0", className)}>
            <div className="flex h-14 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="">UniTrack</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href as any}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-sidebar"
                                        className="ml-auto w-1 h-1 rounded-full bg-primary"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

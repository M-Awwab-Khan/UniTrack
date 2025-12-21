import {
    LayoutDashboard,
    BookOpen,
    CalendarDays,
    Clock,
    Bell,
    Notebook,
    Users,
    Mail,
    Settings,
    Shield
} from "lucide-react";
import React from "react";

export type NavRoute = {
    id: string;
    title: string;
    icon: React.ReactNode;
    link: string;
    subs?: {
        title: string;
        link: string;
        icon?: React.ReactNode;
    }[];
};

export const STUDENT_NAV_ROUTES: NavRoute[] = [
    {
        id: "dashboard",
        title: "Dashboard",
        icon: <LayoutDashboard className="size-4" />,
        link: "/dashboard",
    },
    {
        id: "courses",
        title: "My Courses",
        icon: <BookOpen className="size-4" />,
        link: "/dashboard/courses",
    },
    {
        id: "assignments",
        title: "Assignments",
        icon: <CalendarDays className="size-4" />,
        link: "/dashboard/assignments",
    },
    {
        id: "timetable",
        title: "Timetable",
        icon: <Clock className="size-4" />,
        link: "/dashboard/timetable",
    },
    {
        id: "announcements",
        title: "Announcements",
        icon: <Bell className="size-4" />,
        link: "/dashboard/announcements",
    },
    {
        id: "notes",
        title: "Notes",
        icon: <Notebook className="size-4" />,
        link: "/dashboard/notes",
    },
];

export const ADMIN_NAV_ROUTES: NavRoute[] = [
    {
        id: "admin-dashboard",
        title: "Admin Overview",
        icon: <Shield className="size-4" />,
        link: "/admin",
    },
    {
        id: "admin-courses",
        title: "Manage Courses",
        icon: <BookOpen className="size-4" />,
        link: "/admin/courses",
    },
    {
        id: "admin-users",
        title: "Manage Users",
        icon: <Users className="size-4" />,
        link: "/admin/users",
    },
    {
        id: "admin-ta-invites",
        title: "TA Invites",
        icon: <Mail className="size-4" />,
        link: "/admin/ta-invites",
    },
    {
        id: "admin-timetable",
        title: "Timetable Schedule",
        icon: <Settings className="size-4" />,
        link: "/admin/timetable",
    },
];

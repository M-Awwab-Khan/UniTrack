"use client";

import Link from "next/link";
import {
    Bell,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { UserProfileDropdown } from "../user-menu";
import { NotificationBell } from "../notifications/notification-bell";
import { GlobalSearch } from "../layout/global-search";

export function TopNav() {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
            {/* <SidebarTrigger className="-ml-1" /> */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="hidden sm:inline-block">Fall Semester 2024</span>
            </div>
            <div className="relative ml-auto flex-1 md:grow-0">
                <GlobalSearch />
            </div>
            <NotificationBell />
            <UserProfileDropdown />
        </header>
    );
}

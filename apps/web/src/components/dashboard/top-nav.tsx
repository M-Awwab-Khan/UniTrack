"use client";

import Link from "next/link";
import {
    Bell,
    Menu,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "./sidebar";
import { VisuallyHidden } from "radix-ui";
import { UserProfileDropdown } from "../user-menu";
import { NotificationBell } from "../notifications/notification-bell";

export function TopNav() {
    const router = useRouter();
    // const { data: session } = authClient.useSession(); // UserProfileDropdown handles fetching, or we can fetch if needed for other things. 
    // TopNav currently doesn't use session for anything else inside.

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <VisuallyHidden.Root>
                    <SheetTitle>Menu</SheetTitle>
                </VisuallyHidden.Root>
                <SheetContent side="left" className="sm:max-w-xs p-0">
                    <div className="p-6">
                        <DashboardSidebar />
                    </div>
                </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="hidden sm:inline-block">Fall Semester 2024</span>
            </div>
            <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
            </div>
            <NotificationBell />
            <UserProfileDropdown />
        </header>
    );
}

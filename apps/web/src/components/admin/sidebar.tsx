"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Mail,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        title: "Courses",
        href: "/admin/courses",
        icon: BookOpen,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "TA Invites",
        href: "/admin/ta-invites",
        icon: Mail,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);


    const signOut = async () => {
        setSigningOut(true);
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    redirect("/login"); // redirect to login page
                },
            },
        });
        setSigningOut(false);
    }


    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-card border-r">
            <div className="p-6 border-b flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                </div>
                <span className="font-semibold text-lg tracking-tight">UniTrack Admin</span>
            </div>
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link key={item.href} href={item.href as any} onClick={() => setIsOpen(false)}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 h-10 mb-1",
                                    isActive
                                        ? "bg-accent text-accent-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Button>
                        </Link>
                    );
                })}
            </div>
            <div className="p-4 border-t">
                <Button variant="ghost" className="cursor-pointer w-full justify-start gap-3 text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={signOut} disabled={signingOut}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 h-screen fixed top-0 left-0 z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 bg-background/80 backdrop-blur-sm border shadow-sm">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { UserProfileDropdown } from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";

export function Navbar() {
    const { data: session, isPending } = authClient.useSession();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-primary/10 text-primary">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">UniTrack</span>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="#" className="hover:text-primary transition-colors">Features</Link>
                    <Link href="#" className="hover:text-primary transition-colors">How it Works</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Mission</Link>
                </div>

                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {isPending ? (
                        <Skeleton className="h-9 w-20 rounded-md" />
                    ) : session ? (
                        <UserProfileDropdown />
                    ) : (
                        <>
                            <Link href="/login" >
                                <Button variant="ghost" size="sm" className="cursor-pointer hidden sm:flex">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/register" >
                                <Button size="sm" className="cursor-pointer">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

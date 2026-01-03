import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col w-full overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <Suspense>{children}</Suspense>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}


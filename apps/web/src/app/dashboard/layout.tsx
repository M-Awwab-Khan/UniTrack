import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
            <DashboardSidebar className="hidden md:block" />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-2 w-full">
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-2 md:pl-0 w-full">
                    <TopNav />
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted/20">
            <AdminSidebar />
            <main className="md:ml-64 min-h-screen">
                <div className="container py-6 md:py-10 max-w-7xl mx-auto px-4 md:px-8">
                    {children}
                </div>
            </main>
            <Toaster />
        </div>
    );
}

import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@uni-track/auth"
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user) {
        redirect("/login");
    } else if (session.user.role !== "admin") {
        redirect("/");
    } else {
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
}

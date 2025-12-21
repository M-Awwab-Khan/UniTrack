import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-muted/20 min-h-screen flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background md:hidden">
                        <SidebarTrigger className="-ml-1" />
                        <span className="font-semibold px-2">Admin Panel</span>
                    </header>
                    <main className="flex-1 overflow-auto py-6 md:py-10">
                        <div className="container max-w-7xl mx-auto px-4 md:px-8">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        );
    }
}


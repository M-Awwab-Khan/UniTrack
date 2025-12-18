
import { ShieldCheck } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted/40 flex flex-col">
            {/* Simple Admin Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
                <div className="flex items-center gap-2 font-semibold md:text-lg text-primary">
                    <ShieldCheck className="h-6 w-6" />
                    <span>UniTrack Admin</span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Logged in as Admin</span>
                    {/* Allow going back to main app or logout */}
                </div>
            </header>

            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}

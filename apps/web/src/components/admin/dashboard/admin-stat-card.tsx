
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subtitle?: string;
    loading?: boolean;
}

export function AdminStatCard({ title, value, icon: Icon, subtitle, loading }: AdminStatCardProps) {
    if (loading) {
        return (
            <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-4 bg-muted animate-pulse rounded-full" />
                    </div>
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-4" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-900/50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col mt-2">
                    <div className="text-2xl font-bold">{value}</div>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

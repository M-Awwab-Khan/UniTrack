
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface AdminQuickActionButtonProps {
    label: string;
    href: string;
    icon: LucideIcon;
    description?: string;
}

export function AdminQuickActionButton({ label, href, icon: Icon, description }: AdminQuickActionButtonProps) {
    return (
        <Link href={href as any} className="w-full">
            <Button
                variant="outline"
                className="w-full h-auto flex flex-col items-center justify-center gap-3 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
                <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center space-y-1">
                    <span className="font-medium">{label}</span>
                    {description && (
                        <p className="text-xs text-muted-foreground font-normal">{description}</p>
                    )}
                </div>
            </Button>
        </Link>
    );
}

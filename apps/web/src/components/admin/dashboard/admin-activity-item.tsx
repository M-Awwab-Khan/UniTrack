
import { formatDistanceToNow } from "date-fns";
import { Bell, UserPlus, BookOpen, Calendar, AlertCircle } from "lucide-react";

interface AdminActivityItemProps {
    title: string;
    message: string;
    createdAt: Date | string;
    type: string;
}

export function AdminActivityItem({ title, message, createdAt, type }: AdminActivityItemProps) {
    const getIcon = () => {
        switch (type) {
            case 'invite': return UserPlus;
            case 'system': return AlertCircle;
            default: return Bell;
        }
    };

    const Icon = getIcon();

    return (
        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-0">
            <div className="mt-1 p-2 bg-primary/10 rounded-full">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {message}
                </p>
            </div>
        </div>
    );
}


"use client";

import { motion } from "framer-motion";
import type { GlobalClassSession } from "./mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, User } from "lucide-react";

interface ClassCardProps {
    session: GlobalClassSession;
    style?: React.CSSProperties;
    compact?: boolean;
}

export function ClassCard({ session, style, compact }: ClassCardProps) {
    let statusClass = "bg-primary/5 border-primary/20 hover:border-primary/50";
    let statusBadge = null;

    if (session.status === 'Cancelled') {
        statusClass = "bg-red-50 border-red-200 opacity-70 hover:opacity-100 hover:border-red-300";
        statusBadge = (
            <Badge variant="destructive" className="absolute top-2 right-2 text-[10px] h-5 px-1.5 shadow-none">
                Cancelled
            </Badge>
        );
    } else if (session.status === 'Compensatory') {
        statusClass = "bg-blue-50 border-blue-200 hover:border-blue-300 shadow-sm";
        statusBadge = (
            <Badge className="absolute top-2 right-2 text-[10px] h-5 px-1.5 shadow-none bg-blue-600 hover:bg-blue-700">
                Compensatory
            </Badge>
        );
    } else {
        // Normal class - sort of dynamic based on mock color but keeping it subtle
        const colorBase = session.courseColor.replace('bg-', '');
        statusClass = `bg-${colorBase}-50/50 border-${colorBase}-200/60 hover:border-${colorBase}-300 hover:shadow-sm`;
    }

    return (
        <motion.div
            layoutId={session.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
                "relative flex flex-col justify-between p-3 rounded-md border text-left transition-shadow cursor-pointer overflow-hidden",
                statusClass,
                compact ? "text-xs p-2" : "text-sm"
            )}
            style={style}
        >
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", session.courseColor)} />

            {statusBadge}

            <div className="space-y-1 pl-2">
                <div className="flex items-center gap-2">
                    <span className="font-semibold truncate pr-6 text-foreground/90 leading-tight">
                        {session.courseName}
                    </span>
                </div>

                <div className="flex flex-col gap-0.5 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{session.room}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="uppercase text-[10px] font-medium tracking-wide">{session.type}</span>
                    </div>
                </div>
            </div>

            <div className="pl-2 flex items-center justify-between mt-auto pt-2 border-t border-black/5">
                <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Clock className="w-3 h-3" />
                    {session.startTime} - {session.endTime}
                </div>
                {session.instructor && !compact && (
                    <div title={session.instructor} className="w-6 h-6 rounded-full bg-background border flex items-center justify-center text-xs text-muted-foreground">
                        {session.instructor.charAt(0)}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

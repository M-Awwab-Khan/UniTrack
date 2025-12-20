"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Clock, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CancelClassDialog } from "./CancelClassDialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ClassSessionCardProps {
    session: any;
    userRole?: string;
    onUpdate: () => void;
    compact?: boolean;
}

export function ClassSessionCard({ session, userRole, onUpdate, compact = false }: ClassSessionCardProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // If it's an event (Break/Holiday)
    if (session.type === "event") {
        return (
            <Card className={cn(
                "h-full border-muted-foreground/20 shadow-none overflow-hidden",
                session.eventType === "break" ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200" : "bg-muted/50"
            )}>
                <CardContent className="p-2 flex flex-col justify-center h-full items-center text-center">
                    <span className="font-semibold text-muted-foreground text-xs truncate w-full">{session.title}</span>
                    {!compact && session.eventType === "break" && <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium mt-1">Break</span>}
                </CardContent>
            </Card>
        );
    }

    const isCancelled = session.status === "cancelled";
    const isExtra = session.type === "extra" || session.type === "compensatory";
    const isTa = userRole === "ta" || userRole === "admin";

    const CardContentDetails = ({ isPopover = false }) => (
        <div className="flex flex-col h-full justify-center">
            <div>
                <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col overflow-hidden">
                        <span className={cn(
                            "font-bold leading-tight truncate",
                            isCancelled && "line-through text-muted-foreground",
                            compact && !isPopover ? "text-xs" : "text-sm md:text-base"
                        )}>
                            {session.course.code}
                        </span>
                        <span className={cn(
                            "text-muted-foreground truncate",
                            isCancelled && "line-through",
                            compact && !isPopover ? "text-[10px]" : "text-xs md:text-sm"
                        )}>
                            {session.course.name}
                        </span>
                    </div>
                </div>

                <div className={cn("space-y-1", compact && !isPopover ? "mt-1" : "mt-2")}>
                    <div className="flex items-center text-muted-foreground text-xs">
                        <Clock className={cn("mr-1.5 shrink-0", compact && !isPopover ? "h-3 w-3" : "h-3.5 w-3.5")} />
                        <span className="truncate">{session.startTime} - {session.endTime}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-xs">
                        <MapPin className={cn("mr-1.5 shrink-0", compact && !isPopover ? "h-3 w-3" : "h-3.5 w-3.5")} />
                        <span className="truncate">{session.location}</span>
                    </div>
                    {isCancelled && session.cancelReason && (
                        <div className="flex items-start text-xs text-destructive mt-1 bg-destructive/10 p-1 rounded">
                            <AlertCircle className="mr-1 h-3 w-3 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{session.cancelReason}</span>
                        </div>
                    )}
                    {!isCancelled && isExtra && session.note && (
                        <div className="flex items-start text-xs text-muted-foreground mt-1 bg-muted p-1 rounded">
                            <span className="line-clamp-2 italic">{session.note}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Badges only in Popover or if space permits (simplified in compact) */}
            <div className="flex gap-1 mt-2">
                {isCancelled && <Badge variant="destructive" className="py-0 h-5 text-[10px]">Cancelled</Badge>}
                {isExtra && <Badge variant="default" className="py-0 h-5 text-[10px] bg-blue-600 hover:bg-blue-700">Extra</Badge>}
            </div>
        </div>
    );

    return (
        <>
            <Popover open={isHovered} onOpenChange={setIsHovered}>
                <PopoverTrigger asChild>
                    <div
                        className="h-full w-full"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Card className={cn(
                            "py-0 relative group h-full transition-all duration-200 overflow-hidden cursor-default",
                            isCancelled ? "bg-destructive/5 border-destructive/20" : "hover:border-primary/50",
                            isExtra && "border-blue-200 bg-blue-50 dark:bg-blue-950/10 dark:border-blue-800"
                        )}>
                            <CardContent className={cn("flex flex-col h-full", compact ? "p-2" : "p-4")}>
                                <CardContentDetails />
                                {/* TA Cancel Action - Absolute Icon */}
                                {isTa && !isCancelled && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCancelDialog(true);
                                        }}
                                        className="absolute top-1 right-1 p-1 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Cancel Class"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-64 p-4 shadow-lg pointer-events-none"
                    side="right"
                    align="start"
                >
                    <CardContentDetails isPopover={true} />
                </PopoverContent>
            </Popover>

            <CancelClassDialog
                isOpen={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                session={session}
                onSuccess={onUpdate}
            />
        </>
    );
}

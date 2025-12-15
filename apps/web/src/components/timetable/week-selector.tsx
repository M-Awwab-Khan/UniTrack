
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";

interface WeekSelectorProps {
    currentDate: Date;
    onPrevious: () => void;
    onNext: () => void;
    onToday: () => void;
}

export function WeekSelector({ currentDate, onPrevious, onNext, onToday }: WeekSelectorProps) {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });

    return (
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
            <Button variant="ghost" size="icon" onClick={onPrevious} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 px-2 min-w-[200px] justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium tabular-nums">
                    {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
                </span>
            </div>

            <Button variant="ghost" size="icon" onClick={onNext} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="border-l pl-2 ml-1">
                <Button variant="ghost" size="sm" onClick={onToday} className="h-8 text-xs font-medium">
                    Today
                </Button>
            </div>
        </div>
    );
}


"use client";

import { WEEKLY_SCHEDULE } from "./mock-data";
import { ClassCard } from "./class-card";
import { cn } from "@/lib/utils";
import { getDay } from "date-fns";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

interface TimetableGridProps {
    currentDate: Date;
}

export function TimetableGrid({ currentDate }: TimetableGridProps) {
    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    const todayIndex = getDay(currentDate);
    // Convert to our DAYS array index (0 = Monday in our array)
    const currentDayName = todayIndex >= 1 && todayIndex <= 5 ? DAYS[todayIndex - 1] : null;

    const getPositionStyle = (startTime: string, endTime: string) => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const startOffset = (startH - 8) * 60 + startM;
        const duration = (endH * 60 + endM) - (startH * 60 + startM);

        return {
            top: `${(startOffset / 60) * 80}px`, // 80px per hour
            height: `${(duration / 60) * 80}px`,
        };
    };

    return (
        <div className="flex flex-col border rounded-lg overflow-hidden bg-background shadow-sm">
            {/* Days Header */}
            <div className="flex border-b bg-muted/40">
                <div className="w-16 flex-shrink-0 p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r">
                    Time
                </div>
                <div className="flex-1 grid grid-cols-5 divide-x">
                    {DAYS.map(day => (
                        <div
                            key={day}
                            className={cn(
                                "p-3 text-center text-sm font-semibold transition-colors",
                                day === currentDayName
                                    ? "bg-primary/10 text-primary"
                                    : "bg-transparent"
                            )}
                        >
                            {day}
                            {day === currentDayName && (
                                <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                                    Today
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex relative overflow-y-auto max-h-[700px] no-scrollbar">
                {/* Time Column */}
                <div className="w-16 flex-shrink-0 border-r bg-muted/10">
                    {HOURS.map(hour => (
                        <div key={hour} className="h-[80px] border-b text-xs text-muted-foreground p-2 text-right pr-3">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="flex-1 grid grid-cols-5 divide-x relative">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 grid grid-rows-[repeat(10,80px)] pointer-events-none">
                        {HOURS.map(h => (
                            <div key={h} className="border-b border-dashed border-muted/50 w-full" />
                        ))}
                    </div>

                    {DAYS.map(day => {
                        const daySessions = WEEKLY_SCHEDULE.filter(s => s.day === day);
                        const isToday = day === currentDayName;

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "relative min-h-[800px]",
                                    isToday ? "bg-primary/5" : "bg-background/50"
                                )}
                            >
                                {daySessions.map(session => (
                                    <div
                                        key={session.id}
                                        className="absolute w-full px-1 z-10"
                                        style={getPositionStyle(session.startTime, session.endTime)}
                                    >
                                        <ClassCard session={session} style={{ height: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassSessionCard } from "@/components/timetable/ClassSessionCard";
import { AddExtraClassDialog } from "@/components/timetable/AddExtraClassDialog";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

// --- Layout Configuration ---
const START_HOUR = 8; // 8:00 AM
const END_HOUR = 18;  // 6:00 PM
const HOUR_HEIGHT = 140; // px per hour

export default function TimetablePage() {
    const utils = api.useUtils();
    const { data: session } = authClient.useSession();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);

    const userRole = session?.user?.role;
    const isTaOrAdmin = userRole === 'ta' || userRole === 'admin';

    // Timetable Query
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

    const { data: schedule, isLoading } = api.timetable.getWeekSchedule.useQuery({
        startDate,
        endDate,
    });

    const nextWeek = () => setCurrentDate(d => addWeeks(d, 1));
    const prevWeek = () => setCurrentDate(d => subWeeks(d, 1));

    // Grid Generation
    const days = useMemo(() => {
        const d = [];
        for (let i = 0; i < 7; i++) { // Show 7 days? Or 5? Let's show 7 for completeness, maybe hide empty weekends later if needed
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            d.push(day);
        }
        return d;
    }, [startDate]);

    // Time Labels - half hour intervals
    const timeLabels = useMemo(() => {
        const labels = [];
        for (let h = START_HOUR; h <= END_HOUR; h++) {
            // Hour Label
            labels.push(
                <div key={`${h}-00`} className="text-[10px] text-muted-foreground text-right pr-2 -mt-2" style={{ height: HOUR_HEIGHT / 2 }}>
                    {h > 12 ? `${h - 12}:00 PM` : h === 12 ? `12:00 PM` : `${h}:00 AM`}
                </div>
            );
            // Half-hour Label (spacer or subtler text)
            if (h < END_HOUR) {
                labels.push(
                    <div key={`${h}-30`} className="text-[10px] text-muted-foreground/40 text-right pr-2 -mt-2" style={{ height: HOUR_HEIGHT / 2 }}>
                        {h > 12 ? `${h - 12}:30` : h === 12 ? `12:30` : `${h}:30`}
                    </div>
                );
            }
        }
        return labels;
    }, []);

    const getPosition = (timeStr: string): number => {
        const [h = 0, m = 0] = timeStr.split(':').map(Number);
        const minutesFromStart = (h - START_HOUR) * 60 + m;
        return (minutesFromStart / 60) * HOUR_HEIGHT;
    };

    const getHeight = (startStr: string, endStr: string): number => {
        const [h1 = 0, m1 = 0] = startStr.split(':').map(Number);
        const [h2 = 0, m2 = 0] = endStr.split(':').map(Number);
        const durationMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        return (durationMinutes / 60) * HOUR_HEIGHT;
    };

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Timetable</h2>
                    <p className="text-muted-foreground">
                        {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    {isTaOrAdmin && (
                        <Button onClick={() => setIsAddClassOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Class
                        </Button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="flex-1 overflow-hidden border rounded-lg bg-background flex flex-col relative">
                    {/* Header Row (Days) */}
                    <div className="flex border-b bg-muted/20 z-10 sticky top-0">
                        <div className="w-16 shrink-0 border-r bg-background"></div> {/* Time axis spacer */}
                        <div className="flex-1 grid grid-cols-7 divide-x">
                            {days.map((day) => {
                                const isToday = isSameDay(day, new Date());
                                return (
                                    <div key={day.toString()} className={cn(
                                        "py-3 text-center",
                                        isToday ? "bg-primary/5" : ""
                                    )}>
                                        <div className={cn("text-xs font-medium uppercase", isToday ? "text-primary" : "text-muted-foreground")}>
                                            {format(day, "EEE")}
                                        </div>
                                        <div className={cn("text-lg font-bold", isToday ? "text-primary" : "")}>
                                            {format(day, "d")}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scrollable Grid Area */}
                    <div className="flex-1 overflow-y-auto relative no-scrollbar">
                        <div className="flex min-w-[800px]"> {/* Ensure min-width for mobile scroll */}
                            {/* Time Axis */}
                            <div className="w-16 shrink-0 border-r bg-background sticky left-0 z-20 pt-4">
                                {timeLabels}
                            </div>

                            {/* Main Grid Mesh */}
                            <div className="flex-1 grid grid-cols-7 divide-x relative">
                                {/* Horizontal Guidelines (Background) */}
                                <div className="absolute inset-0 z-0 pointer-events-none w-full">
                                    {Array.from({ length: (END_HOUR - START_HOUR) * 2 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "w-full border-b",
                                                i % 2 === 0 ? "border-slate-200 dark:border-slate-800" : "border-slate-100/50 dark:border-slate-900/50 border-dashed"
                                            )}
                                            style={{ height: HOUR_HEIGHT / 2 }}
                                        />
                                    ))}
                                </div>

                                {/* Day Columns */}
                                {days.map((day) => {
                                    const dayClasses = schedule?.filter((s: any) =>
                                        isSameDay(new Date(s.date), day)
                                    ) || [];
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <div key={day.toString()} className={cn(
                                            "relative h-full z-10",
                                            isToday ? "bg-primary/5" : ""
                                        )}
                                            style={{ height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT }}
                                        >
                                            {dayClasses.map((session: any) => {
                                                if (session.type === 'event' && session.eventType === 'break') {
                                                    // Render breaks differently? 
                                                    // For now, render full-day/time-specific breaks as blocks overlaying content
                                                    return (
                                                        <div
                                                            key={session.id}
                                                            className="absolute inset-x-0 bg-muted/80 z-20 flex items-center justify-center border-y border-dashed border-muted-foreground/30"
                                                            style={{
                                                                top: 0,
                                                                bottom: 0
                                                            }}
                                                        >
                                                            <span className="text-muted-foreground font-medium -rotate-90 md:rotate-0">{session.title}</span>
                                                        </div>
                                                    );
                                                }

                                                if (session.type === 'event') return null; // Ignore small events for now if not blocking

                                                const top = getPosition(session.startTime);
                                                const height = getHeight(session.startTime, session.endTime);

                                                return (
                                                    <div
                                                        key={session.id}
                                                        className="absolute inset-x-1 p-0.5"
                                                        style={{
                                                            top: `${top}px`,
                                                            height: `${height}px`,
                                                        }}
                                                    >
                                                        <ClassSessionCard
                                                            session={session}
                                                            userRole={userRole || ""}
                                                            onUpdate={() => {
                                                                utils.timetable.getWeekSchedule.invalidate({
                                                                    startDate,
                                                                    endDate,
                                                                });
                                                            }}
                                                            compact
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isTaOrAdmin && (
                <AddExtraClassDialog
                    isOpen={isAddClassOpen}
                    onClose={() => setIsAddClassOpen(false)}
                    onSuccess={() => {
                        utils.timetable.getWeekSchedule.invalidate({
                            startDate,
                            endDate,
                        });
                    }}
                />
            )}
        </div>
    );
}

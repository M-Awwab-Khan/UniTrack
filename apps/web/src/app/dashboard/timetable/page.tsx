
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WeekSelector } from "@/components/timetable/week-selector";
import { TimetableGrid } from "@/components/timetable/timetable-grid";
import { ClassHistoryList } from "@/components/timetable/class-history-list";
import { addWeeks, subWeeks } from "date-fns";

export default function TimetablePage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePreviousWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
    const handleNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
    const handleToday = () => setCurrentDate(new Date());

    return (
        <div className="w-full max-w-[1600px] mx-auto pb-10 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Your weekly academic schedule at a glance
                    </p>
                </div>

                <WeekSelector
                    currentDate={currentDate}
                    onPrevious={handlePreviousWeek}
                    onNext={handleNextWeek}
                    onToday={handleToday}
                />
            </motion.div>

            {/* Main Content Layout */}
            <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Timetable Grid */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <TimetableGrid currentDate={currentDate} />
                </motion.div>

                {/* Sidebar / History */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:sticky lg:top-6"
                >
                    <ClassHistoryList />
                </motion.div>
            </div>
        </div>
    );
}

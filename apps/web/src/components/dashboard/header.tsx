"use client";

import { motion } from "framer-motion";

interface DashboardHeaderProps {
    userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Good Morning, {userName} 👋</h1>
                <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening today.</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border px-4 py-2 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-foreground">{formattedDate}</span>
            </div>
        </motion.div>
    );
}

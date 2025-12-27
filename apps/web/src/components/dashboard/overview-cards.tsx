"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function OverviewCards() {
    // const utils = api.useUtils();
    const { data: stats, isLoading } = (api.studentDashboard.getStats.useQuery());

    const skeletonCards = Array(4).fill(0).map((_, i) => (
        <Card key={i} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-[120px]" />
            </CardContent>
        </Card>
    ));

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {skeletonCards}
            </div>
        );
    }

    const cards = [
        {
            title: "Enrolled Courses",
            value: `${stats?.enrolledCourses ?? 0} Courses`,
            icon: BookOpen,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Upcoming Deadlines",
            value: `${stats?.upcomingDeadlines ?? 0} Due This Week`,
            icon: Clock,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
        {
            title: "Overdue Tasks",
            value: `${stats?.overdueTasks ?? 0} Missed`,
            icon: AlertCircle,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
        },
        {
            title: "Today's Classes",
            value: `${stats?.todaysClasses ?? 0} Classes`,
            icon: Calendar,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
        >
            {cards.map((card, index) => (
                <motion.div key={index} variants={item} whileHover={{ y: -5 }}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                            <div className={`p-2 rounded-full ${card.bgColor}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
}

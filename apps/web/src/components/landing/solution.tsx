"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Calendar, Bell, BookOpen, Clock, FolderKanban } from "lucide-react";

const solutions = [
    {
        icon: <LayoutDashboard className="w-8 h-8 text-primary" />,
        title: "Centralized Hub",
        description: "Access all your courses, materials, and updates from a single, unified dashboard.",
    },
    {
        icon: <Calendar className="w-8 h-8 text-blue-500" />,
        title: "Timetable Tracking",
        description: "Know exactly where you need to be with a smart, automated class schedule.",
    },
    {
        icon: <Clock className="w-8 h-8 text-orange-500" />,
        title: "Smart Deadlines",
        description: "Never miss a submission with automated countdowns and reminders.",
    },
    {
        icon: <Bell className="w-8 h-8 text-red-500" />,
        title: "Unified Announcements",
        description: "Stop scrolling through WhatsApp. Get important updates in one clean feed.",
    },
    {
        icon: <BookOpen className="w-8 h-8 text-green-500" />,
        title: "Notes & Resources",
        description: "Keep your lecture notes and reference materials organized by course.",
    },
    {
        icon: <FolderKanban className="w-8 h-8 text-purple-500" />,
        title: "Project Management",
        description: "Track group projects and individual assignments with ease.",
    }
];

export function SolutionSection() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                        UniTrack Brings Everything Together.
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        No more switching tabs. No more "I forgot." Just a calm, organized academic life.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutions.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="mb-6 p-4 rounded-xl bg-muted w-fit">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

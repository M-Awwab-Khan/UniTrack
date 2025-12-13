"use client";

import { motion } from "framer-motion";
import { MessageCircle, FileText, ClipboardList, Mic } from "lucide-react";

const problems = [
    {
        id: 1,
        icon: <ClipboardList className="w-6 h-6 text-yellow-500" />,
        text: "Assignments buried in Google Classroom",
        source: "LMS",
    },
    {
        id: 2,
        icon: <FileText className="w-6 h-6 text-purple-500" />,
        text: "Deadlines hidden in Google Forms",
        source: "Course Work",
    },
    {
        id: 3,
        icon: <MessageCircle className="w-6 h-6 text-green-500" />,
        text: "Announcements scattered on WhatsApp",
        source: "Group Chat",
    },
    {
        id: 4,
        icon: <Mic className="w-6 h-6 text-red-500" />,
        text: "Critical instructions given verbally",
        source: "Lecture",
    },
];

export function ProblemSection() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                            The Problem Isn’t Forgetfulness. <br />
                            <span className="text-muted-foreground">It’s Fragmentation.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Students don't miss deadlines because they are lazy. They miss them because academic life is scattered across a dozen different platforms, apps, and group chats.
                        </p>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-background/50 z-10 pointer-events-none" />
                        <div className="space-y-4">
                            {problems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    className="flex items-center gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm"
                                >
                                    <div className="p-3 rounded-full bg-muted shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{item.text}</p>
                                        <p className="text-xs text-muted-foreground">{item.source}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

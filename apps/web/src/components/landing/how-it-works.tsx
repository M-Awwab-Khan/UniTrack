"use client";

import { motion } from "framer-motion";
import { UserPlus, CheckCircle, BellRing } from "lucide-react";

const steps = [
    {
        icon: <UserPlus className="w-8 h-8" />,
        title: "Join Your Courses",
        description: "Simply select your subjects for the semester. All schedules and groups are auto-synced.",
    },
    {
        icon: <CheckCircle className="w-8 h-8" />,
        title: "Track Assignments",
        description: "See all your deadlines in one timeline. Submit work and mark as done.",
    },
    {
        icon: <BellRing className="w-8 h-8" />,
        title: "Stay Updated",
        description: "Receive instant notifications for class changes, grades, and announcements.",
    },
];

export function HowItWorksSection() {
    return (
        <section className="py-24 bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-muted-foreground">Three simple steps to academic organized bliss.</p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 max-w-5xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="absolute top-12 left-[16%] w-[68%] h-0.5 bg-muted hidden md:block -z-10" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="flex flex-col items-center text-center relative bg-transparent"
                        >
                            <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-6 z-10 shadow-sm transition-colors hover:border-primary">
                                <div className="text-primary">
                                    {step.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground px-4">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

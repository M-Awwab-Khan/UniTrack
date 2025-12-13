"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export function BuiltForAcademia() {
    return (
        <section className="py-24 bg-muted/20">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <Quote className="w-12 h-12 text-primary/20 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                        "Designed specifically to reduce late submissions and minimize teacher overhead."
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
                        <div className="p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-lg font-semibold mb-2">Student Accountability</p>
                            <p className="text-muted-foreground">Students can no longer say "I didn't know". Every deadline is explicit and tracked.</p>
                        </div>
                        <div className="p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-lg font-semibold mb-2">Teacher Sanity</p>
                            <p className="text-muted-foreground">Stop answering "When is it due?" on WhatsApp at 11 PM. It's all on the dashboard.</p>
                        </div>
                        <div className="p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-lg font-semibold mb-2">Department Friendly</p>
                            <p className="text-muted-foreground">Coordinators can push announcements to entire batches in one click.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

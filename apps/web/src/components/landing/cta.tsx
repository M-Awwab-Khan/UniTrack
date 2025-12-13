"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-bold mb-8 tracking-tight"
                >
                    A Smarter Way to <br /> Manage University Life.
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
                >
                    <Button size="lg" className="rounded-full h-14 px-10 text-lg hover:shadow-lg hover:shadow-primary/20 transition-all">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg">
                        View Demo
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}

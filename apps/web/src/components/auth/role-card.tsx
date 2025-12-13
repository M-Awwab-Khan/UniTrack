"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface RoleCardProps {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    disabled?: boolean;
    onSelect: (id: string) => void;
}

export function RoleCard({ id, title, description, icon, selected, disabled, onSelect }: RoleCardProps) {
    return (
        <motion.div
            whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={() => !disabled && onSelect(id)}
            className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all cursor-pointer",
                selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 bg-card",
                disabled && "opacity-50 cursor-not-allowed grayscale"
            )}
        >
            <div className="flex justify-between w-full mb-3">
                <div className={cn(
                    "p-2 rounded-lg",
                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                    {icon}
                </div>
                {selected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-primary"
                    >
                        <CheckCircle2 size={20} />
                    </motion.div>
                )}
            </div>

            <h3 className="font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground leading-snug">{description}</p>

            {disabled && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl">
                    <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">Coming Soon</span>
                </div>
            )}
        </motion.div>
    );
}

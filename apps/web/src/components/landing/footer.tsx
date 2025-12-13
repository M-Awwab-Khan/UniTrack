import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function FooterSection() {
    return (
        <footer className="py-12 border-t border-border bg-muted/10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-lg leading-none">UniTrack</p>
                            <p className="text-xs text-muted-foreground">Academic Management Platform</p>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground text-center md:text-right">
                        <p>Built by students, for students.</p>
                        <p>&copy; {new Date().getFullYear()} UniTrack. Open Source.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

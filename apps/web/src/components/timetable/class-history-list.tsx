
"use client";

import { CLASS_HISTORY } from "./mock-data";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { History, Clock, } from "lucide-react"; // Note: Room isn't a valid lucide icon, checking alternatives
import { MapPin } from "lucide-react"; // Using MapPin instead

export function ClassHistoryList() {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Conducted': return "bg-green-100 text-green-700 hover:bg-green-100";
            case 'Cancelled': return "bg-red-100 text-red-700 hover:bg-red-100";
            case 'Compensatory': return "bg-blue-100 text-blue-700 hover:bg-blue-100";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="bg-card rounded-xl border shadow-sm flex flex-col h-full max-h-[800px]">
            <div className="p-4 border-b flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Recent Activity</h3>
            </div>

            <ScrollArea className="flex-1">
                <div className="divide-y">
                    {CLASS_HISTORY.map((session) => (
                        <div key={session.id} className="p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm line-clamp-1" title={session.courseName}>{session.courseName}</span>
                                    <span className="text-xs text-muted-foreground">{session.courseCode}</span>
                                </div>
                                <Badge variant="secondary" className={getStatusColor(session.status)}>
                                    {session.status}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-foreground">{format(new Date(session.date!), 'MMM d')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {session.startTime}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {session.room}
                                </div>
                            </div>

                            {session.note && (
                                <p className="text-xs text-muted-foreground mt-2 italic bg-muted/50 p-1.5 rounded">
                                    Note: {session.note}
                                </p>
                            )}
                        </div>
                    ))}
                    {CLASS_HISTORY.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No recent class history found.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

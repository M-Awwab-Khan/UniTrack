"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarIcon,
    Plus,
    Trash2,
    Clock,
    MapPin,
    ChevronRight,
    MoreHorizontal,
    Archive,
    Eye,
    Calendar as CalendarLucide,
    BookOpen,
    GraduationCap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { api } from "@/trpc/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

// --- Framer Motion Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AdminTimetableManagementPage() {
    const utils = api.useUtils();
    const [activeTab, setActiveTab] = useState("semesters");

    // Context-aware primary action
    const renderPrimaryAction = () => {
        switch (activeTab) {
            case "semesters":
                return <CreateSemesterDialog utils={utils} />;
            case "calendar":
                return <CreateEventDialog utils={utils} />;
            case "templates":
                return <CreateTemplateDialog utils={utils} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Timetable Management</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage semesters, academic calendar events, and weekly class templates.
                    </p>
                </div>
                <div>
                    {renderPrimaryAction()}
                </div>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            {/* Main Content with Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200 dark:border-slate-700 inline-flex h-auto">
                    <TabTrigger value="semesters" icon={<GraduationCap className="w-4 h-4 mr-2" />} label="Semesters" activeTab={activeTab} />
                    <TabTrigger value="calendar" icon={<CalendarLucide className="w-4 h-4 mr-2" />} label="Academic Calendar" activeTab={activeTab} />
                    <TabTrigger value="templates" icon={<BookOpen className="w-4 h-4 mr-2" />} label="Class Templates" activeTab={activeTab} />
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TabsContent value="semesters" className="space-y-6 mt-0">
                            <SemestersTab utils={utils} />
                        </TabsContent>

                        <TabsContent value="calendar" className="space-y-6 mt-0">
                            <AcademicCalendarTab utils={utils} />
                        </TabsContent>

                        <TabsContent value="templates" className="space-y-6 mt-0">
                            <TemplatesTab utils={utils} />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}

// --- Custom Tab Trigger ---
function TabTrigger({ value, icon, label, activeTab }: { value: string, icon: React.ReactNode, label: string, activeTab: string }) {
    const isActive = activeTab === value;
    return (
        <TabsTrigger
            value={value}
            className={cn(
                "rounded-full px-6 py-2 transition-all duration-300 relative z-10",
                isActive
                    ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
        >
            <div className="flex items-center">
                {icon}
                {label}
            </div>
        </TabsTrigger>
    );
}

// ----------------------------------------------------------------------
// 🟦 TAB 1: Semesters
// ----------------------------------------------------------------------

function SemestersTab({ utils }: { utils: ReturnType<typeof api.useUtils> }) {
    const { data: semesters, isLoading } = api.admin.getSemesters.useQuery();

    if (isLoading) return <LoadingState />;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {semesters && semesters.length > 0 ? (
                semesters.map((sem: any) => <SemesterCard key={sem.id} sem={sem} />)
            ) : (
                <EmptyState
                    label="No semesters created yet"
                    actionLabel="Create your first semester"
                    onAction={() => document.getElementById("create-semester-trigger")?.click()} // Simple hack to trigger dialog or manage via state lifting if needed
                />
            )}
        </motion.div>
    );
}

function SemesterCard({ sem }: { sem: any }) {
    const statusColors = {
        active: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        archived: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        upcoming: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    };

    const status = sem.status as keyof typeof statusColors;

    return (
        <motion.div variants={itemVariants} whileHover={{ y: -4, boxShadow: "lg" }} className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-950">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">{sem.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Created {format(new Date(sem.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <Badge variant="outline" className={cn("capitalize px-3 py-1", statusColors[status] || statusColors.archived)}>
                        {sem.status}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                <CalendarIcon className="mr-3 h-4 w-4 text-slate-400" />
                                <span className="font-medium">Start:</span>
                                <span className="ml-2">{format(new Date(sem.startDate), "PPP")}</span>
                            </div>
                            {sem.endDate && (
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                    <CalendarIcon className="mr-3 h-4 w-4 text-slate-400" />
                                    <span className="font-medium">End:</span>
                                    <span className="ml-2">{format(new Date(sem.endDate), "PPP")}</span>
                                </div>
                            )}
                        </div>

                        <Separator className="bg-slate-100 dark:bg-slate-800" />

                        <div className="flex justify-end pt-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                                    <DropdownMenuItem><Archive className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function CreateSemesterDialog({ utils }: { utils: ReturnType<typeof api.useUtils> }) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({ name: "", startDate: undefined as Date | undefined, endDate: undefined as Date | undefined });

    const mutation = api.admin.createSemester.useMutation({
        onSuccess: () => {
            utils.admin.getSemesters.invalidate();
            setOpen(false);
            toast.success("Semester created successfully");
            setData({ name: "", startDate: undefined, endDate: undefined });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.name || !data.startDate) { toast.error("Required fields missing"); return; }
        mutation.mutate({ name: data.name, startDate: data.startDate, endDate: data.endDate });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button id="create-semester-trigger" size="lg" className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Create Semester
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Semester</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Semester Name</Label>
                        <Input placeholder="e.g. Fall 2025" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <DatePicker date={data.startDate} setDate={d => setData({ ...data, startDate: d })} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date (Optional)</Label>
                            <DatePicker date={data.endDate} setDate={d => setData({ ...data, endDate: d })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Creating..." : "Create Semester"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


// ----------------------------------------------------------------------
// 🟨 TAB 2: Academic Calendar
// ----------------------------------------------------------------------

function AcademicCalendarTab({ utils }: { utils: ReturnType<typeof api.useUtils> }) {
    const { data: events, isLoading } = api.admin.getAcademicEvents.useQuery();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    if (isLoading) return <LoadingState />;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid lg:grid-cols-3 gap-8">
            {/* List View */}
            <div className="lg:col-span-1 space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Upcoming Events</h3>
                <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                        {events && events.length > 0 ? (
                            events.map((evt: any) => <EventCard key={evt.id} evt={evt} />)
                        ) : (
                            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">No events scheduled</div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Calendar View */}
            <div className="lg:col-span-2">
                <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardContent className="p-6">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border-0 w-full"
                            classNames={{
                                day_selected: "bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200",
                                day_today: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}

function EventCard({ evt }: { evt: any }) {
    const typeColors = {
        break: "bg-rose-50 border-l-4 border-rose-500 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400",
        holiday: "bg-purple-50 border-l-4 border-purple-500 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400",
        exam: "bg-amber-50 border-l-4 border-amber-500 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
        event: "bg-slate-50 border-l-4 border-slate-500 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400",
    };

    return (
        <motion.div key={evt.id} initial="hidden" animate="visible"
            onAnimationStart={() => console.log("Animation started")}
            onAnimationComplete={() => console.log("Animation complete")}
            variants={itemVariants} className={cn("p-4 rounded-r-lg shadow-sm border border-slate-100 dark:border-slate-800", typeColors[evt.type as keyof typeof typeColors])}>
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h4 className="font-semibold text-sm">{evt.title}</h4>
                    <p className="text-xs opacity-80">{format(new Date(evt.startDate), "MMM d")} - {format(new Date(evt.endDate), "MMM d, yyyy")}</p>
                </div>
                <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-[10px] uppercase tracking-wider">{evt.type}</Badge>
            </div>
        </motion.div>
    );
}

function CreateEventDialog({ utils }: { utils: ReturnType<typeof api.useUtils> }) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({ title: "", type: "break", startDate: undefined as Date | undefined, endDate: undefined as Date | undefined, description: "" });

    const mutation = api.admin.createAcademicEvent.useMutation({
        onSuccess: () => {
            utils.admin.getAcademicEvents.invalidate();
            setOpen(false);
            toast.success("Event added");
            setData({ title: "", type: "break", startDate: undefined, endDate: undefined, description: "" });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.title || !data.startDate || !data.endDate) { toast.error("Missing required fields"); return; }
        mutation.mutate({ ...data, type: data.type as any, startDate: data.startDate, endDate: data.endDate });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Academic Event</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Event Title</Label>
                        <Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder="e.g. Semester Break" />
                    </div>
                    <div className="space-y-2">
                        <Label>Event Type</Label>
                        <Select value={data.type} onValueChange={v => setData({ ...data, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="break">Break (No Classes)</SelectItem>
                                <SelectItem value="holiday">Holiday</SelectItem>
                                <SelectItem value="exam">Exam Period</SelectItem>
                                <SelectItem value="event">General Event</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Start Date</Label><DatePicker date={data.startDate} setDate={d => setData({ ...data, startDate: d })} /></div>
                        <div className="space-y-2"><Label>End Date</Label><DatePicker date={data.endDate} setDate={d => setData({ ...data, endDate: d })} /></div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Adding..." : "Add Event"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


// ----------------------------------------------------------------------
// 🟩 TAB 3: Class Templates
// ----------------------------------------------------------------------

function TemplatesTab({ utils }: { utils: ReturnType<typeof api.useUtils> }) {
    const { data: templates, isLoading } = api.admin.getTimetableTemplates.useQuery();

    if (isLoading) return <LoadingState />;

    // Group by Course
    const grouped = templates?.reduce((acc: any, curr: any) => {
        if (!acc[curr.courseId]) acc[curr.courseId] = { course: curr.course, slots: [] };
        acc[curr.courseId].slots.push(curr);
        return acc;
    }, {});

    const groupedArray = grouped ? Object.values(grouped) : [];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {groupedArray.length > 0 ? (
                groupedArray.map((group: any) => <CourseTemplateCard key={group.course.id} group={group} />)
            ) : (
                <EmptyState label="No class templates defined" actionLabel="Create your first template" onAction={() => { }} />
            )}
        </motion.div>
    );
}

function CourseTemplateCard({ group }: { group: any }) {
    return (
        <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">{group.course.code}</h4>
                        <p className="text-sm text-muted-foreground">{group.course.name}</p>
                    </div>
                    <Badge variant="secondary">{group.slots.length} Slots</Badge>
                </div>
                <div className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {group.slots.map((slot: any) => (
                        <div key={slot.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                            <div className="flex items-center space-x-6">
                                <div className="w-24 font-medium text-sm text-slate-500 uppercase tracking-widest">
                                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][parseInt(slot.dayOfWeek)] || "Unknown"}
                                </div>
                                <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>{slot.startTime} - {slot.endTime}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 text-sm">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{slot.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
}

function CreateTemplateDialog({ utils }: { utils: ReturnType<typeof api.useUtils> }) {
    const [open, setOpen] = useState(false);
    const { data: courses } = api.admin.getCourses.useQuery();

    const [data, setData] = useState({ courseId: "", dayOfWeek: "1", startTime: "", endTime: "", location: "" });

    const mutation = api.admin.createTimetableTemplate.useMutation({
        onSuccess: () => {
            utils.admin.getTimetableTemplates.invalidate();
            setOpen(false);
            toast.success("Class slot added");
            setData({ courseId: "", dayOfWeek: "1", startTime: "", endTime: "", location: "" });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Add Template
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Weekly Class Slot</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Course</Label>
                        <Select value={data.courseId} onValueChange={v => setData({ ...data, courseId: v })}>
                            <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                            <SelectContent>
                                {courses?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select value={data.dayOfWeek} onValueChange={v => setData({ ...data, dayOfWeek: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => (
                                    <SelectItem key={i} value={i.toString()}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={data.startTime} onChange={e => setData({ ...data, startTime: e.target.value })} /></div>
                        <div className="space-y-2"><Label>End Time</Label><Input type="time" value={data.endTime} onChange={e => setData({ ...data, endTime: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input placeholder="Room 304" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Adding..." : "Add Slot"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ----------------------------------------------------------------------
// 🛠️ Shared Components
// ----------------------------------------------------------------------

function DatePicker({ date, setDate }: { date: Date | undefined; setDate: (d: Date | undefined) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !date && "text-muted-foreground")}>
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
        </Popover>
    );
}

function EmptyState({ label, actionLabel, onAction }: { label: string, actionLabel?: string, onAction?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 col-span-full">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
                <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{label}</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6">Start by adding your first item to manage the schedule efficiently.</p>
            {actionLabel && (
                <Button onClick={onAction} variant="outline">{actionLabel}</Button>
            )}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
        </div>
    );
}

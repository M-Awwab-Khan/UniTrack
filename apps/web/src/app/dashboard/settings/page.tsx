"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Bell, Moon, Sun, Monitor, Shield, LogOut, Clock, LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes"; // Assuming next-themes is used, or simulate
import { api } from "@/trpc/react";

export default function SettingsPage() {
    const utils = api.useUtils();
    // Fetch settings
    const { data: settings, isLoading, refetch } = api.settings.getSettings.useQuery();
    const { setTheme: setSystemTheme, theme: currentTheme } = useTheme();

    const updatePreferences = api.settings.updatePreferences.useMutation({
        onSuccess: () => {
            toast.success("Preferences saved");
            refetch();
        },
        onError: (err) => toast.error(err.message),
    });

    const updateNotifications = api.settings.updateNotifications.useMutation({
        onSuccess: () => {
            toast.success("Notification settings saved");
            refetch();
        },
        onError: (err) => toast.error(err.message),
    });

    const handleThemeChange = (val: string) => {
        setSystemTheme(val); // Update client theme instantly
        updatePreferences.mutate({ theme: val as any });
    };

    if (isLoading) return <div className="p-8 space-y-4 max-w-3xl mx-auto"><Skeleton className="h-12 w-48 mb-6" /><Skeleton className="h-64 w-full rounded-xl" /></div>;

    const prefs = settings?.preferences;
    const notifs = settings?.notifications;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your application preferences and account settings.</p>
            </div>

            <Tabs defaultValue="preferences" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>

                {/* PREFERENCES */}
                <TabsContent value="preferences" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interface & Appearance</CardTitle>
                            <CardDescription>Customize how UniTrack looks and feels.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Theme</Label>
                                    <div className="text-sm text-muted-foreground">Select your preferred color scheme.</div>
                                </div>
                                <div className="flex bg-muted p-1 rounded-lg">
                                    {(["light", "dark", "system"] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => handleThemeChange(t)}
                                            className={`p-2 rounded-md transition-all ${prefs?.theme === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                            title={t}
                                        >
                                            {t === "light" && <Sun className="h-4 w-4" />}
                                            {t === "dark" && <Moon className="h-4 w-4" />}
                                            {t === "system" && <Monitor className="h-4 w-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Default Landing Page</Label>
                                    <Select
                                        defaultValue={prefs?.defaultPage || "dashboard"}
                                        onValueChange={(v) => updatePreferences.mutate({ defaultPage: v as any })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dashboard">Dashboard</SelectItem>
                                            <SelectItem value="assignments">Assignments</SelectItem>
                                            <SelectItem value="timetable">Timetable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Time Format</Label>
                                    <Select
                                        defaultValue={prefs?.timeFormat || "12h"}
                                        onValueChange={(v) => updatePreferences.mutate({ timeFormat: v as any })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                                            <SelectItem value="24h">24-hour</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* NOTIFICATIONS */}
                <TabsContent value="notifications" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email & Alerts</CardTitle>
                            <CardDescription>Control when and how you receive notifications.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="assignments" className="flex flex-col space-y-1">
                                    <span>Assignment Reminders</span>
                                    <span className="font-normal text-xs text-muted-foreground">Receive alerts for upcoming deadlines.</span>
                                </Label>
                                <Switch
                                    id="assignments"
                                    checked={notifs?.assignmentReminders ?? true}
                                    onCheckedChange={(c) => updateNotifications.mutate({ assignmentReminders: c })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="announcements" className="flex flex-col space-y-1">
                                    <span>Announcements</span>
                                    <span className="font-normal text-xs text-muted-foreground">Notify me when new announcements are posted.</span>
                                </Label>
                                <Switch
                                    id="announcements"
                                    checked={notifs?.announcementNotifications ?? true}
                                    onCheckedChange={(c) => updateNotifications.mutate({ announcementNotifications: c })}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Reminder Timing</Label>
                                <Select
                                    defaultValue={notifs?.reminderTiming || "1_day"}
                                    onValueChange={(v) => updateNotifications.mutate({ reminderTiming: v as any })}
                                >
                                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3_days">3 days before</SelectItem>
                                        <SelectItem value="1_day">1 day before</SelectItem>
                                        <SelectItem value="same_day">Same day (Morning)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ACCOUNT */}
                <TabsContent value="account" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Security</CardTitle>
                            <CardDescription>Manage your session and login security.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-medium">Password</div>
                                    <div className="text-sm text-muted-foreground">Change your password logic here (if applicable).</div>
                                </div>
                                <Button variant="outline">Change Password</Button>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-medium text-destructive">Sign Out</div>
                                    <div className="text-sm text-muted-foreground">Sign out of your account on this device.</div>
                                </div>
                                <Button variant="destructive" className="gap-2">
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

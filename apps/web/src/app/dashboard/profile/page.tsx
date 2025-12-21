"use client";

import { useTRPC } from "@/utils/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Mail, Shield, User, GraduationCap, Building2, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const trpc = useTRPC();
    const { data: profile, isLoading, refetch } = useQuery(trpc.profile.getProfile.queryOptions());

    // Optimistic / Local state for name editing
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        if (profile) setName(profile.name);
    }, [profile]);

    const updateProfile = useMutation(trpc.profile.updateBasicInfo.mutationOptions({
        onSuccess: () => {
            toast.success("Profile updated");
            setIsEditing(false);
            refetch();
        },
        onError: (err) => toast.error(err.message),
    }));

    const updateStudent = useMutation(trpc.profile.updateStudentProfile.mutationOptions({
        onSuccess: () => {
            toast.success("Academic info updated");
            refetch();
        },
        onError: (err) => toast.error(err.message),
    }));

    const handleSaveBasic = () => {
        updateProfile.mutate({ name });
    };

    if (isLoading) return <div className="p-8 space-y-4 max-w-3xl mx-auto"><Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-64 w-full rounded-xl" /></div>;
    if (!profile) return <div>Error loading profile</div>;

    const initials = profile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    const roleColor = profile.role === "admin" ? "destructive" : profile.role === "teacher" ? "default" : profile.role === "ta" ? "secondary" : "outline";

    return (
        <div className="max-w-3xl mx-auto space-y-8 p-6">

            {/* Header */}
            <div className="flex flex-col items-center justify-center space-y-4 text-center py-6">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                    <AvatarImage src={profile.image || ""} />
                    <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                    <div className="flex items-center justify-center gap-2">
                        <Badge variant={roleColor as any} className="uppercase text-xs tracking-wider px-3 py-1">{profile.role}</Badge>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{profile.email}</span>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Basic Info */}
            <Card className="border-none shadow-sm bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                        <User className="h-5 w-5 text-muted-foreground" />
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={!isEditing}
                                    className={isEditing ? "bg-background" : "bg-muted/50 border-none"}
                                />
                                {isEditing ? (
                                    <>
                                        <Button size="sm" onClick={handleSaveBasic} disabled={updateProfile.isPending}>
                                            {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setName(profile.name); }}>Cancel</Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="flex items-center h-10 px-3 py-2 rounded-md bg-muted/50 text-muted-foreground text-sm gap-2 w-full">
                                <Mail className="h-4 w-4" />
                                {profile.email}
                                {profile.emailVerified && <Shield className="h-3 w-3 text-green-500 ml-auto" />}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Academic Info */}
            <Card className="border-none shadow-sm bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        Academic Profile
                    </CardTitle>
                    <CardDescription>Role-specific academic details.</CardDescription>
                </CardHeader>
                <CardContent>
                    {profile.role === "student" && profile.studentProfile && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Roll Number</Label>
                                <div className="h-10 px-3 py-2 rounded-md bg-muted/50 text-sm font-mono">{profile.studentProfile.rollNumber}</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <div className="flex items-center h-10 px-3 py-2 rounded-md bg-muted/50 text-sm gap-2">
                                    <Building2 className="h-4 w-4 opacity-50" />
                                    {profile.studentProfile.department}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Batch</Label>
                                <div className="h-10 px-3 py-2 rounded-md bg-muted/50 text-sm">{profile.studentProfile.batch}</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Semester</Label>
                                <Input
                                    defaultValue={profile.studentProfile.semester}
                                    onBlur={(e) => {
                                        if (e.target.value !== profile.studentProfile?.semester) {
                                            updateStudent.mutate({ semester: e.target.value });
                                        }
                                    }}
                                    className="bg-background"
                                    placeholder="Enter Semester"
                                />
                                <p className="text-[10px] text-muted-foreground">Click outside to save</p>
                            </div>
                        </div>
                    )}

                    {profile.role === "ta" && profile.taProfile && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <div className="flex items-center h-10 px-3 py-2 rounded-md bg-muted/50 text-sm gap-2">
                                    <Building2 className="h-4 w-4 opacity-50" />
                                    {profile.taProfile.department}
                                </div>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Assigned duties</Label>
                                <div className="p-4 rounded-md bg-muted/30 text-sm text-muted-foreground">
                                    TA assignments are managed by the course instructor. Please check your dashboard for active courses.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add similar blocks for Teacher/Admin if needed, simpler for now */}
                    {(profile.role === "teacher" || profile.role === "admin") && (
                        <div className="p-4 rounded-md bg-muted/30 text-sm text-muted-foreground">
                            {profile.role === "admin" ? "System Administrator account. Full access granted." : "Faculty account. Course assignments managed by Registrar."}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { Loader2, Mail, Calendar, User, BookOpen, GraduationCap, Shield } from "lucide-react";
import { format } from "date-fns";

interface UserDetailModalProps {
    userId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserDetailModal({ userId, open, onOpenChange }: UserDetailModalProps) {
    const utils = api.useUtils();
    const { data: user, isLoading, error } = api.admin.users.getById.useQuery(
        { id: userId },
        { enabled: open }
    );

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                    <DialogDescription>
                        Detailed information about this user account.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">
                        Failed to load user details.
                    </div>
                ) : user ? (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">{user.name}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={user.emailVerified ? "default" : "secondary"}>
                                            {user.emailVerified ? "Verified" : "Unverified"}
                                        </Badge>
                                        <Badge variant="outline" className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* General Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <User className="h-3 w-3" /> User ID
                                </span>
                                <p className="font-mono text-xs text-foreground/80 truncate" title={user.id}>{user.id}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-3 w-3" /> Joined
                                </span>
                                <p>{format(new Date(user.createdAt), "PPP")}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Role Specific Info */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm tracking-tight uppercase text-muted-foreground">
                                {user.role} Details
                            </h4>

                            {user.role === "student" && user.studentProfile && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <span className="text-xs text-muted-foreground">Roll Number</span>
                                        <p className="font-medium">{user.studentProfile.rollNumber}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Department</span>
                                        <p className="font-medium">{user.studentProfile.department}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Semester</span>
                                        <p className="font-medium">{user.studentProfile.semester}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Batch</span>
                                        <p className="font-medium">{user.studentProfile.batch}</p>
                                    </div>
                                </div>
                            )}

                            {user.role === "ta" && user.taProfile && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-muted-foreground">Department</span>
                                        <p className="font-medium">{user.taProfile.department}</p>
                                    </div>
                                    {/* Future: Display assigned courses here */}
                                    <div className="col-span-2 p-3 bg-muted/30 rounded-md border border-dashed">
                                        <p className="text-muted-foreground text-xs text-center flex items-center justify-center gap-2">
                                            <BookOpen className="h-3 w-3" />
                                            Course assignments are managed via "TA Invites"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {user.role === "teacher" && user.teacherProfile && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-muted-foreground">Department</span>
                                        <p className="font-medium">{user.teacherProfile.department}</p>
                                    </div>
                                </div>
                            )}

                            {user.role === "admin" && (
                                <div className="p-4 bg-red-50 text-red-900 rounded-md flex items-start gap-3">
                                    <Shield className="h-5 w-5 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">Administrator Access</p>
                                        <p className="text-xs mt-1 opacity-90">
                                            This user has full access to system settings, user management, and course controls.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

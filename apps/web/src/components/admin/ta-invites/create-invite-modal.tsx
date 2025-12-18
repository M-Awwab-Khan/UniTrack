
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Loader2 } from "lucide-react";
import { PERMISSION_OPTIONS } from "./mock-data";
import { toast } from "sonner";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

interface CreateInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateInviteModal({ isOpen, onClose, onSuccess }: CreateInviteModalProps) {
    const trpc = useTRPC();
    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("CS");
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['create_assignments']);

    // Fetch courses
    const { data: courses = [], isLoading: coursesLoading } = useQuery(trpc.admin.getCourses.queryOptions(undefined, {
        enabled: isOpen,
    }));


    // Create invite mutation
    const createInvite = useMutation(trpc.admin.createTaInvite.mutationOptions({
        onSuccess: (data: { inviteCode: string }) => {
            toast.success(`Invite created successfully!`, {
                description: `Invite code: ${data.inviteCode}`,
            });
            resetForm();
            onClose();
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error("Failed to create invite", {
                description: error.message,
            });
        },
    }));

    const resetForm = () => {
        setFullName("");
        setEmail("");
        setDepartment("CS");
        setSelectedCourses([]);
        setSelectedPermissions(['create_assignments']);
    };

    const handleCourseToggle = (courseId: string) => {
        setSelectedCourses(prev =>
            prev.includes(courseId) ? prev.filter(c => c !== courseId) : [...prev, courseId]
        );
    };

    const handlePermissionToggle = (id: string) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        // Validation
        if (!fullName || !email) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (selectedCourses.length === 0) {
            toast.error("Please assign at least one course");
            return;
        }
        if (selectedPermissions.length === 0) {
            toast.error("Please select at least one permission");
            return;
        }

        createInvite.mutate({
            fullName,
            email,
            department,
            courseIds: selectedCourses,
            permissions: selectedPermissions,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 sm:rounded-xl">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Create Teaching Assistant Invite</DialogTitle>
                    <DialogDescription>
                        Generate a secure invite code for a new TA and assign their permissions.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 py-4">
                    <div className="space-y-6">
                        {/* 1. Basic Info */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="Inam ul Haq"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    disabled={createInvite.isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">University Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="inam@uni.edu"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={createInvite.isPending}
                                />
                            </div>
                        </div>

                        {/* 2. Department */}
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={department} onValueChange={setDepartment} disabled={createInvite.isPending}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CS">Computer Science</SelectItem>
                                    <SelectItem value="SE">Software Engineering</SelectItem>
                                    <SelectItem value="EE">Electrical Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 3. Course Assignment */}
                        <div className="space-y-3">
                            <Label>Assign Courses <span className="text-red-500">*</span></Label>
                            <div className="border rounded-lg p-3 bg-muted/10">
                                {coursesLoading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : courses.length === 0 ? (
                                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                                        No courses available
                                    </div>
                                ) : (
                                    <ScrollArea className="h-32 pr-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {(courses as any[]).map((course: any) => (
                                                <div key={course.id} className="flex items-center space-x-2 rounded-md border p-2 bg-card hover:bg-accent/50 transition-colors">
                                                    <Checkbox
                                                        id={`course-${course.id}`}
                                                        checked={selectedCourses.includes(course.id)}
                                                        onCheckedChange={() => handleCourseToggle(course.id)}
                                                        disabled={createInvite.isPending}
                                                    />
                                                    <div className="grid gap-0.5 leading-none">
                                                        <label
                                                            htmlFor={`course-${course.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {course.code}
                                                        </label>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">{course.name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>
                            {selectedCourses.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {selectedCourses.map((courseId: string) => {
                                        const course = (courses as any[]).find((c: any) => c.id === courseId);
                                        return course ? (
                                            <Badge key={courseId} variant="secondary" className="text-[10px] h-5">
                                                {course.code}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 4. Permissions */}
                        <div className="space-y-3">
                            <Label>Permissions</Label>
                            <div className="grid sm:grid-cols-2 gap-3 min-w-0">
                                {PERMISSION_OPTIONS.map(permission => (
                                    <div key={permission.id} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-card shadow-sm">
                                        <Checkbox
                                            id={permission.id}
                                            checked={selectedPermissions.includes(permission.id)}
                                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                                            disabled={createInvite.isPending}
                                        />
                                        <div className="space-y-1 leading-none">
                                            <Label htmlFor={permission.id} className="cursor-pointer">
                                                {permission.label}
                                            </Label>
                                            <p className="text-xs text-muted-foreground font-normal">
                                                Allow TA to perform this action.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 py-4 border-t bg-muted/5 gap-2">
                    <Button variant="outline" onClick={onClose} disabled={createInvite.isPending}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={createInvite.isPending} className="gap-2">
                        {createInvite.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" /> Create Invite
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

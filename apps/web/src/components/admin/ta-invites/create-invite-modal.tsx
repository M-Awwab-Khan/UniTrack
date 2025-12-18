
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
import { RefreshCw, Copy, Plus } from "lucide-react";
import { ALL_COURSES, PERMISSION_OPTIONS } from "./mock-data";
import { toast } from "sonner";

interface CreateInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateInviteModal({ isOpen, onClose }: CreateInviteModalProps) {
    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("CS");
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['create_assignments']);
    const [inviteCode, setInviteCode] = useState("");

    // Generate code on open
    useEffect(() => {
        if (isOpen && !inviteCode) {
            generateCode();
        }
    }, [isOpen]);

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1
        let result = 'TA-';
        for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        result += '-';
        for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setInviteCode(result);
    };

    const handleCourseToggle = (code: string) => {
        setSelectedCourses(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
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
            alert("Please fill in all required fields.");
            return;
        }
        if (selectedCourses.length === 0) {
            alert("Please assign at least one course.");
            return;
        }

        // Mock Submit
        const newInvite = {
            taName: fullName,
            taEmail: email,
            inviteCode,
            assignedCourses: selectedCourses,
            permissions: selectedPermissions,
            createdOn: new Date().toISOString(),
            status: 'Active'
        };

        console.log("Creating Invite:", newInvite);
        alert(`Invite created for ${email}!`);

        // Reset and Close
        onClose();
        setFullName("");
        setEmail("");
        setSelectedCourses([]);
        setSelectedPermissions(['create_assignments']);
        generateCode();
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
                                <Input id="name" placeholder="Inam ul Haq" value={fullName} onChange={e => setFullName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">University Email <span className="text-red-500">*</span></Label>
                                <Input id="email" type="email" placeholder="inam@uni.edu" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                        </div>

                        {/* 2. Department & Invite Configuration */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select value={department} onValueChange={setDepartment}>
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
                            <div className="space-y-2">
                                <Label>Invite Code (Auto-generated)</Label>
                                <div className="flex gap-2">
                                    <Input value={inviteCode} readOnly className="font-mono bg-muted text-center tracking-widest" />
                                    <Button variant="outline" size="icon" onClick={generateCode} title="Regenerate">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Course Assignment */}
                        <div className="space-y-3">
                            <Label>Assign Courses <span className="text-red-500">*</span></Label>
                            <div className="border rounded-lg p-3 bg-muted/10">
                                <ScrollArea className="h-32 pr-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {ALL_COURSES.map(course => (
                                            <div key={course.code} className="flex items-center space-x-2 rounded-md border p-2 bg-card hover:bg-accent/50 transition-colors">
                                                <Checkbox
                                                    id={`course-${course.code}`}
                                                    checked={selectedCourses.includes(course.code)}
                                                    onCheckedChange={() => handleCourseToggle(course.code)}
                                                />
                                                <div className="grid gap-0.5 leading-none">
                                                    <label
                                                        htmlFor={`course-${course.code}`}
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
                            </div>
                            {selectedCourses.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {selectedCourses.map(c => (
                                        <Badge key={c} variant="secondary" className="text-[10px] h-5">{c}</Badge>
                                    ))}
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
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} className="gap-2">
                        <Plus className="w-4 h-4" /> Create Invite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

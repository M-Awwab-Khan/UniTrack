"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, RefreshCw, XCircle, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminEnrollmentCodesPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Create Form State
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [maxUses, setMaxUses] = useState<string>("");
    const [expiryDays, setExpiryDays] = useState("7");

    const trpc = useTRPC();

    const { data: codes, isLoading } = useQuery(trpc.admin.enrollmentCodes.list.queryOptions({ courseId: selectedCourseId }));
    const { data: courses } = useQuery(trpc.admin.getCourses.queryOptions());

    const createMutation = useMutation(trpc.admin.enrollmentCodes.generate.mutationOptions({
        onSuccess: () => {
            const key = trpc.admin.enrollmentCodes.list.queryKey({ courseId: selectedCourseId });
            queryClient.invalidateQueries({ queryKey: key });
            setIsCreateOpen(false);
            toast.success("Enrollment code created successfully");
            setSelectedCourseId("");
            setMaxUses("");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    }));

    const revokeMutation = useMutation(trpc.admin.enrollmentCodes.revoke.mutationOptions({
        onSuccess: () => {
            const key = trpc.admin.enrollmentCodes.list.queryKey({ courseId: selectedCourseId });
            queryClient.invalidateQueries({ queryKey: key });
            toast.success("Code revoked");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    }));

    const handleCreate = () => {
        if (!selectedCourseId) return;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

        createMutation.mutate({
            courseId: selectedCourseId,
            expiresAt: parseInt(expiryDays) > 0 ? expiresAt : undefined, // Assuming logic handles date
            maxUses: maxUses ? parseInt(maxUses) : undefined
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.info("Copied to clipboard");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/courses">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Enrollment Codes</h1>
                    <p className="text-muted-foreground">Manage student access codes for all courses.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Generate Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate Enrollment Code</DialogTitle>
                            <DialogDescription>
                                Create a new code for students to join a course.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Course</Label>
                                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a course..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses?.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.code} - {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Max Uses (Optional)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Unlimited"
                                        value={maxUses}
                                        onChange={(e) => setMaxUses(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expires In</Label>
                                    <Select value={expiryDays} onValueChange={setExpiryDays}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 Day</SelectItem>
                                            <SelectItem value="3">3 Days</SelectItem>
                                            <SelectItem value="7">7 Days</SelectItem>
                                            <SelectItem value="30">30 Days</SelectItem>
                                            <SelectItem value="120">Semester (120 Days)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={!selectedCourseId || createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead className="font-mono">Code</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Uses</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && codes?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    No enrollment codes found.
                                </TableCell>
                            </TableRow>
                        )}
                        {codes?.map((code) => (
                            <TableRow key={code.id}>
                                <TableCell className="font-medium">
                                    {code.course.code} <br />
                                    <span className="text-xs text-muted-foreground font-normal">{code.course.name}</span>
                                </TableCell>
                                <TableCell>
                                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{code.code}</code>
                                </TableCell>
                                <TableCell>
                                    {code.isActive ? (
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>
                                    ) : (
                                        <Badge variant="secondary">Inactive</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {code.uses} {code.maxUses ? `/ ${code.maxUses}` : ""}
                                </TableCell>
                                <TableCell>
                                    {code.expiresAt ? format(new Date(code.expiresAt), "MMM d, yyyy") : "Never"}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {code.createdBy?.name || "Admin"} <br />
                                    {format(new Date(code.createdAt), "MMM d, HH:mm")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(code.code)} title="Copy Code">
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        {code.isActive && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => revokeMutation.mutate({ id: code.id })}
                                                title="Revoke Code"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {/* Regenerate is essentially creating a new one for same course, easy enough via modal */}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

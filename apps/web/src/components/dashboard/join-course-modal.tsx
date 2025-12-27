"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/trpc/react";

interface JoinCourseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function JoinCourseModal({ open, onOpenChange, onSuccess }: JoinCourseModalProps) {
    const [code, setCode] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [coursePreview, setCoursePreview] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const utils = api.useUtils();


    const checkMutation = (api.courses.getEnrollInfoByCode.useQuery(
        { code },
        {
            enabled: false,
            retry: false
        }
    ));

    const enrollMutation = (api.courses.enrollWithCode.useMutation({
        onSuccess: () => {
            utils.studentDashboard.getMyCourses.invalidate();
            setCoursePreview(null);
            setCode("");
            setError(null);
            onOpenChange(false);
            if (onSuccess) onSuccess();
        },
        onError: (err) => {
            setError(err.message);
        }
    }));

    const handleCheckCode = async () => {
        if (!code || code.length < 5) return;
        setError(null);
        setIsChecking(true);
        try {
            const result = await checkMutation.refetch();
            if (result.data) {
                setCoursePreview(result.data);
            } else if (result.error) {
                setError(result.error.message);
                setCoursePreview(null);
            }
        } catch (e) {
            setError("Failed to validate code");
        } finally {
            setIsChecking(false);
        }
    };

    const handleEnroll = () => {
        enrollMutation.mutate({ code });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join a Course</DialogTitle>
                    <DialogDescription>
                        Enter the enrollment code provided by your instructor or administrator.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Enrollment Code</Label>
                        <div className="flex gap-2">
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.toUpperCase());
                                    setCoursePreview(null);
                                    setError(null);
                                }}
                                placeholder="e.g. SE-OS-X9K2"
                                className="uppercase font-mono"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCheckCode();
                                }}
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleCheckCode}
                                disabled={isChecking || !code}
                                variant="secondary"
                            >
                                {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {coursePreview && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{coursePreview.courseName}</h4>
                                    <p className="text-xs text-muted-foreground">{coursePreview.courseCode} • {coursePreview.semester}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{coursePreview.department}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={enrollMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEnroll}
                        disabled={!coursePreview || enrollMutation.isPending}
                    >
                        {enrollMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enrolling...
                            </>
                        ) : (
                            "Confirm Enrollment"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

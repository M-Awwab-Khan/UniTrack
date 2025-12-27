"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner"; // Assuming sonner is used or use toast from hooks

interface CancelClassDialogProps {
    isOpen: boolean;
    onClose: () => void;
    session: any; // Type this properly if possible
    onSuccess: () => void;
}

export function CancelClassDialog({ isOpen, onClose, session, onSuccess }: CancelClassDialogProps) {
    const utils = api.useUtils();
    const [reason, setReason] = useState("");
    const cancelClass = api.ta.updateClassSession.useMutation({
        onSuccess: () => {
            toast.success("Class cancelled successfully");
            onSuccess();
            onClose();
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });


    const handleSubmit = () => {
        if (!reason) {
            toast.error("Reason is required");
            return;
        }
        cancelClass.mutate({
            sessionId: session.id,
            action: "cancel",
            reason: reason,
        });
    };

    function getDaySuffix(day: number) {
        if (day > 3 && day < 21) return 'th'; // Catch 4-20
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    const sessionDate = new Date(session?.date);
    const formattedDate = `${sessionDate.toLocaleString('en-US', { weekday: 'long' })}, ${sessionDate.toLocaleString('en-US', { month: 'long' })} ${sessionDate.getDate()}${getDaySuffix(sessionDate.getDate())}, ${sessionDate.getFullYear()}`;



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Class</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel {session?.course?.code} on {formattedDate}?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason for cancellation</Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g. Instructor unavailable, Emergency..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Keep Class
                    </Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={cancelClass.isPending}>
                        {cancelClass.isPending ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

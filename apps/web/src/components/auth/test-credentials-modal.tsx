"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function TestCredentialsModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(true);
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Test Credentials</DialogTitle>
                    <DialogDescription>
                        Use the following credentials to test the application for different roles.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium tracking-tight">1. Admin</h4>
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md font-mono">
                            <p>Email: admin@unitrack.com</p>
                            <p>Password: StrongPass123!</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium tracking-tight">2. TA</h4>
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md font-mono">
                            <p>Email: smrayyan@gmail.com</p>
                            <p>Password: StrongPass123!</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium tracking-tight">3. Student</h4>
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md font-mono">
                            <p>Email: abyazkhalid@gmail.com</p>
                            <p>Password: StrongPass123!</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

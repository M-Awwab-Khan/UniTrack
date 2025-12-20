"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, GraduationCap, BookOpen, Users } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useState } from "react";
import { UserDetailModal } from "./user-detail-modal";

export type User = {
    id: string;
    name: string;
    email: string;
    role: "student" | "ta" | "teacher" | "admin";
    emailVerified: boolean;
    createdAt: string | Date;
    status: string;
    department: string;
};

const RoleBadge = ({ role }: { role: string }) => {
    switch (role) {
        case "admin":
            return <Badge variant="destructive" className="flex gap-1 items-center"><Shield className="h-3 w-3" /> Admin</Badge>;
        case "teacher":
            return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100/80 flex gap-1 items-center"><Users className="h-3 w-3" /> Teacher</Badge>;
        case "ta":
            return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100/80 flex gap-1 items-center"><BookOpen className="h-3 w-3" /> TA</Badge>;
        default:
            return <Badge variant="outline" className="flex gap-1 items-center"><GraduationCap className="h-3 w-3" /> Student</Badge>;
    }
};

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
    },
    {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => <div>{row.getValue("department")}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={status === "Active" ? "default" : "secondary"} className={status === "Active" ? "bg-green-600 hover:bg-green-700" : ""}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <div className="text-muted-foreground text-sm">{format(date, "MMM dd, yyyy")}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original;
            const [showDetailModal, setShowDetailModal] = useState(false);

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                Copy User ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowDetailModal(true)}>
                                View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                Deactivate Account
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {showDetailModal && (
                        <UserDetailModal
                            userId={user.id}
                            open={showDetailModal}
                            onOpenChange={setShowDetailModal}
                        />
                    )}
                </>
            );
        },
    },
];

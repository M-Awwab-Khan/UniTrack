
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Ban, Eye } from "lucide-react";
import { type TAInvite } from "./mock-data";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is set up, or just console log/alert for now

interface TAInvitesTableProps {
    invites: TAInvite[];
    onRevoke: (id: string) => void;
    isRevoking?: boolean;
}

export function TAInvitesTable({ invites, onRevoke, isRevoking }: TAInvitesTableProps) {
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Invite code copied to clipboard!");
    };

    const getStatusColor = (status: TAInvite['status']) => {
        switch (status) {
            case 'active': return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200";
            case 'used': return "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200";
            case 'expired': return "bg-orange-100 text-orange-700 hover:bg-orange-100/80 border-orange-200";
            case 'revoked': return "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="rounded-md border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>TA Name</TableHead>
                        <TableHead>Assigned Courses</TableHead>
                        <TableHead>Invite Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invites.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No TA invites found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        invites.map((invite) => (
                            <TableRow key={invite.id} className="group">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{invite.taName}</span>
                                        <span className="text-xs text-muted-foreground">{invite.taEmail}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {invite.assignedCourses.map(c => (
                                            <Badge key={c.code} variant="outline" className="text-[10px] px-1.5 h-5 font-normal bg-muted/50">
                                                {c.code}
                                            </Badge>
                                        ))}
                                        {invite.assignedCourses.length === 0 && <span className="text-xs text-muted-foreground italic">None</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono border">
                                            {invite.inviteCode}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleCopyCode(invite.inviteCode)}
                                            title="Copy Code"
                                        >
                                            <Copy className="w-3 h-3 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={cn("font-medium border shadow-none capitalize", getStatusColor(invite.status))}>
                                        {invite.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {format(new Date(invite.createdOn), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleCopyCode(invite.inviteCode)}>
                                                <Copy className="mr-2 h-4 w-4" /> Copy Code
                                            </DropdownMenuItem>
                                            <DropdownMenuItem disabled>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {invite.status === 'active' && (
                                                <DropdownMenuItem
                                                    onClick={() => onRevoke(invite.id)}
                                                    disabled={isRevoking}
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    <Ban className="mr-2 h-4 w-4" /> Revoke Invite
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

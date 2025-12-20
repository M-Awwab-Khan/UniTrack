"use client";

import { useState } from "react";
import { useTRPC } from "@/utils/trpc";
import { DataTable } from "@/components/admin/users/data-table";
import { columns } from "@/components/admin/users/columns";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, FilterX, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function UsersPage() {
    const trpc = useTRPC();
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");

    // Debounce search could be added here, but for now direct state is fine or useDebounce hook if available.
    // relying on simple state for this iteration.

    const { data: users, isLoading, isError, error } = useQuery(trpc.admin.users.list.queryOptions({
        page: pageIndex + 1,
        limit: pageSize,
        search: search || undefined,
        role: roleFilter !== "all" ? (roleFilter as any) : undefined,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
    }, {
        placeholderData: (prev) => prev,
    }));

    const clearFilters = () => {
        setSearch("");
        setRoleFilter("all");
        setDepartmentFilter("all");
        setPageIndex(0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="h-8 w-8 text-primary" />
                    User Management
                </h1>
                <p className="text-muted-foreground">
                    Manage all registered users across the platform. View roles, departments, and statuses.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center bg-card p-4 rounded-lg border">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                    {/* Search */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">Search</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPageIndex(0); // Reset page on filter change
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Role</label>
                        <Select
                            value={roleFilter}
                            onValueChange={(val) => {
                                setRoleFilter(val);
                                setPageIndex(0);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="ta">TA</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Department Filter - Hardcoded for now based on requirements */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Department</label>
                        <Select
                            value={departmentFilter}
                            onValueChange={(val) => {
                                setDepartmentFilter(val);
                                setPageIndex(0);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Depts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="CS">CS</SelectItem>
                                <SelectItem value="SE">SE</SelectItem>
                                <SelectItem value="EE">EE</SelectItem>
                                <SelectItem value="MATH">MATH</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Clear Filters */}
                <div className="pb-0.5">
                    {(search || roleFilter !== "all" || departmentFilter !== "all") && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                            <FilterX className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center p-12 bg-card rounded-lg border">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading users...</span>
                </div>
            ) : isError ? (
                <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-100">
                    <h3 className="font-semibold">Error loading users</h3>
                    <p className="text-sm mt-1">{error.message}</p>
                    <Button variant="outline" className="mt-4 bg-white" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={users || []}
                    pagination={{ pageIndex, pageSize }}
                    onPaginationChange={(p) => {
                        setPageIndex(p.pageIndex);
                        setPageSize(p.pageSize);
                    }}
                // Note: Since we are not returning total count from backend yet, 
                // we rely on "next" button being disabled if current items < page size in the DataTable logic 
                // or passed explicitly. The generic DataTable handles basic next/prev.
                // Ideally pass pageCount here if available.
                />
            )}
        </div>
    );
}

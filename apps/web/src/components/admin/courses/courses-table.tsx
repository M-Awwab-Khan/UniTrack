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
import { useTRPC } from "@/utils/trpc";
import { format } from "date-fns";
import { Loader2, MoreHorizontal, Edit, Archive, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CoursesTable() {
    const trpc = useTRPC();
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const limit = 10; // Items per page

    const { data: courses = [], isLoading, isError } = useQuery(
        trpc.admin.getAllCourses.queryOptions({
            page,
            limit,
            search: searchTerm,
        })
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to first page on search
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={courses.length < limit || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-red-500">
                                    Failed to load courses.
                                </TableCell>
                            </TableRow>
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course: any) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.code}</TableCell>
                                    <TableCell>{course.name}</TableCell>
                                    <TableCell>{course.department}</TableCell>
                                    <TableCell>{course.semester || "-"}</TableCell>
                                    <TableCell>{course.creditHours || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={course.status === "active" ? "outline" : "secondary"} className={course.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}>
                                            {course.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {format(new Date(course.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem disabled>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem disabled className="text-amber-600 focus:text-amber-600">
                                                    <Archive className="mr-2 h-4 w-4" /> Archive
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

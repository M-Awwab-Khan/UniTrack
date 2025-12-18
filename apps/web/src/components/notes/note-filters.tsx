
"use client";

import { Search, Filter, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NoteFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    typeFilter: string;
    setTypeFilter: (type: string) => void;
    courseFilter: string;
    setCourseFilter: (course: string) => void;
    courses: string[];
}

export function NoteFilters({
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    courseFilter,
    setCourseFilter,
    courses,
}: NoteFiltersProps) {
    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Search and Course Filter */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search notes by title or topic..."
                            className="pl-9 w-full bg-card"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-card">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                <SelectValue placeholder="All Courses" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {courses.map(course => (
                                <SelectItem key={course} value={course}>{course}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort Options */}
                <div className="hidden md:flex">
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                        <SortDesc className="w-4 h-4" />
                        Most Recent
                    </Button>
                </div>
            </div>

            {/* Type Tabs */}
            <div className="overflow-x-auto pb-1">
                <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full">
                    <TabsList className="bg-transparent p-0 h-auto gap-2">
                        {["All", "Lecture Notes", "Slides", "Lab Manual", "Reference", "Link"].map((type) => (
                            <TabsTrigger
                                key={type}
                                value={type}
                                className="rounded-full border px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors text-xs sm:text-sm"
                            >
                                {type}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
}

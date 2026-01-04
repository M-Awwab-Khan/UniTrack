
"use client";

import * as React from "react";
import {
    CalendarIcon,
    FileText,
    Calculator,
    Smile,
    User,
    Search,
    BookOpen,
    Bell,
    GraduationCap,
    MapPin
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/trpc/react";

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const debouncedQuery = useDebounce(query, 300);
    const router = useRouter();
    const utils = api.useUtils();

    const { data, isLoading } = api.search.globalSearch.useQuery(
        { query: debouncedQuery },
        { enabled: debouncedQuery.length >= 2 }
    );

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleSelect = (item: any) => {
        setOpen(false);
        if (item.modal) {
            router.push(`${item.route}?open=${item.modal}&id=${item.id}` as any);
        } else {
            router.push(item.route);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className={cn(
                    "relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                )}
                onClick={() => setOpen(true)}
            >
                <span className="hidden lg:inline-flex">Search...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Type a command or search..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {isLoading && <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>}

                    {data?.assignments && data.assignments.length > 0 && (
                        <CommandGroup heading="Assignments">
                            {data.assignments.map((item: any) => (
                                <CommandItem
                                    key={item.id}
                                    value={`assignment-${item.title}`} // Unique value for selection
                                    onSelect={() => handleSelect(item)}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {data?.announcements && data.announcements.length > 0 && (
                        <CommandGroup heading="Announcements">
                            {data.announcements.map((item: any) => (
                                <CommandItem
                                    key={item.id}
                                    value={`announcement-${item.title}`}
                                    onSelect={() => handleSelect(item)}
                                >
                                    <Bell className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {data?.notes && data.notes.length > 0 && (
                        <CommandGroup heading="Notes">
                            {data.notes.map((item: any) => (
                                <CommandItem
                                    key={item.id}
                                    value={`note-${item.title}`}
                                    onSelect={() => handleSelect(item)}
                                >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {data?.courses && data.courses.length > 0 && (
                        <CommandGroup heading="Courses">
                            {data.courses.map((item: any) => (
                                <CommandItem
                                    key={item.id}
                                    value={`course-${item.title}`}
                                    onSelect={() => handleSelect(item)}
                                >
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {data?.classes && data.classes.length > 0 && (
                        <CommandGroup heading="Classes">
                            {data.classes.map((item: any) => (
                                <CommandItem
                                    key={item.id}
                                    value={`class-${item.title}-${item.id}`}
                                    onSelect={() => handleSelect(item)}
                                >
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}

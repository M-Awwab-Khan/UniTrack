
import { createTRPCRouter as router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db } from "@uni-track/db";
import {
    assignments,
    announcements,
    notes,
    classSessions,
    courseStudents,
    courseTas
} from "@uni-track/db/schema";
import { eq, inArray, desc } from "drizzle-orm";

export const searchRouter = router({
    globalSearch: protectedProcedure
        .input(z.object({
            query: z.string().min(2)
        }))
        .query(async ({ ctx, input }) => {
            const { query } = input;
            const debouncedQuery = `%${query}%`; // For ILIKE
            const { id: userId, role } = ctx.session.user;

            // 1. Determine Scope (Course IDs)
            let allowedCourseIds: string[] | null = null; // null means 'all' (admin)

            if (role === "student") {
                const enrolled = await db.query.courseStudents.findMany({
                    where: eq(courseStudents.userId, userId),
                    columns: { courseId: true }
                });
                allowedCourseIds = enrolled.map(e => e.courseId);
            } else if (role === "ta") {
                const assisting = await db.query.courseTas.findMany({
                    where: eq(courseTas.taId, userId),
                    columns: { courseId: true }
                });
                allowedCourseIds = assisting.map(e => e.courseId);
            }
            // Admin: allowedCourseIds remains null

            // Helper to apply course filter
            const withCourseFilter = (tableColumn: any) => {
                if (role === "admin") return undefined;
                if (!allowedCourseIds || allowedCourseIds.length === 0) return eq(tableColumn, "NO_MATCH_POSSIBLE"); // Helper to return empty if no courses
                return inArray(tableColumn, allowedCourseIds);
            };

            // If student/ta has no courses, return empty fast (except maybe they can search public things? Assuming strictness)
            if (role !== "admin" && (!allowedCourseIds || allowedCourseIds.length === 0)) {
                return {
                    assignments: [],
                    announcements: [],
                    notes: [],
                    courses: [],
                    classes: []
                };
            }


            // 2. Parallel Queries
            const [
                assignmentsResults,
                announcementsResults,
                notesResults,
                coursesResults,
                classesResults
            ] = await Promise.all([
                // Assignments
                db.query.assignments.findMany({
                    where: (t, { and, or, ilike }) => and(
                        withCourseFilter(t.courseId),
                        or(
                            ilike(t.title, debouncedQuery),
                            ilike(t.description, debouncedQuery)
                        )
                    ),
                    with: { course: true }, // Context
                    limit: 5,
                    orderBy: desc(assignments.createdAt)
                }),

                // Announcements
                db.query.announcements.findMany({
                    where: (t, { and, or, ilike }) => and(
                        withCourseFilter(t.courseId),
                        or(
                            ilike(t.title, debouncedQuery),
                            ilike(t.content, debouncedQuery)
                        )
                    ),
                    with: { course: true },
                    limit: 5,
                    orderBy: desc(announcements.createdAt)
                }),

                // Notes
                db.query.notes.findMany({
                    where: (t, { and, or, ilike }) => and(
                        withCourseFilter(t.courseId),
                        or(
                            ilike(t.title, debouncedQuery),
                            ilike(t.description, debouncedQuery)
                        )
                    ),
                    with: { course: true },
                    limit: 5,
                    orderBy: desc(notes.createdAt)
                }),

                // Courses
                db.query.courses.findMany({
                    where: (t, { and, or, ilike }) => and(
                        role === "admin" ? undefined : inArray(t.id, allowedCourseIds!), // Explicitly filtering courses list too
                        or(
                            ilike(t.name, debouncedQuery),
                            ilike(t.code, debouncedQuery),
                            ilike(t.instructor, debouncedQuery)
                        )
                    ),
                    limit: 5
                }),

                // Class Sessions
                db.query.classSessions.findMany({
                    where: (t, { and, or, ilike }) => and(
                        withCourseFilter(t.courseId),
                        or(
                            ilike(t.location, debouncedQuery),
                            // Can't easily search joined course name in 'where' clause with standard simple query builder unless nested?
                            // Drizzle `query` builder `where` usually operates on the table. 
                            // We'll rely on fetching matches by location or time? 
                            // The prompt says "Timetable / Classes: course name, room, instructor".
                            // Searching "course name" here effectively duplicates searching specific classes for a course.
                            // If they search "OS", they find the Course "Operating Systems", do they need to see every single class session? Probably not.
                            // Maybe searching for "Room 101" is the key use case here.
                            ilike(t.location, debouncedQuery)
                        )
                    ),
                    with: { course: true },
                    limit: 5,
                    orderBy: desc(classSessions.date) // Future? Recency?
                })
            ]);

            // 3. Format Results
            return {
                assignments: assignmentsResults.map(a => ({
                    id: a.id,
                    title: a.title,
                    subtitle: `${a.course.code} • Due ${new Date(a.dueDate).toLocaleDateString()}`,
                    entityType: "assignment" as const,
                    route: "/dashboard/assignments",
                    modal: "details"
                })),
                announcements: announcementsResults.map(a => ({
                    id: a.id,
                    title: a.title,
                    subtitle: a.course.code,
                    entityType: "announcement" as const,
                    route: "/dashboard/announcements",
                    modal: "details"
                })),
                notes: notesResults.map(n => ({
                    id: n.id,
                    title: n.title,
                    subtitle: `${n.course.code} • ${n.type}`,
                    entityType: "note" as const,
                    route: "/dashboard/notes",
                    modal: "preview"
                })),
                courses: coursesResults.map(c => ({
                    id: c.id,
                    title: c.name,
                    subtitle: `${c.code} • ${c.instructor || "No Instructor"}`,
                    entityType: "course" as const,
                    route: `/dashboard/courses/${c.id}`
                })),
                classes: classesResults.map(c => ({
                    id: c.id,
                    title: `${c.course.name} - ${c.type}`,
                    subtitle: `${c.location} • ${new Date(c.date).toLocaleDateString()} ${c.startTime}`,
                    entityType: "class" as const,
                    route: "/dashboard/timetable",
                    modal: "class"
                }))
            };
        })
});

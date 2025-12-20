import { router, protectedProcedure } from "../index";
import { z } from "zod";
import { db, classSessions } from "@uni-track/db";

export const timetableRouter = router({
    getWeekSchedule: protectedProcedure
        .input(
            z.object({
                startDate: z.coerce.date(),
                endDate: z.coerce.date(),
            })
        )
        .query(async ({ input }) => {
            const { startDate, endDate } = input;

            // 1. Get Active/Overlapping Semesters for the range
            const activeSemesters = await db.query.semesters.findMany({
                where: (sem, { and, lte, gte, or, isNull }) => and(
                    lte(sem.startDate, endDate),
                    or(isNull(sem.endDate), gte(sem.endDate, startDate))
                )
            });

            if (activeSemesters.length === 0) return [];

            // 2. Fetch Relevant Sessions (Scheduled in range OR Originally from this range)
            const existingSessions = await db.query.classSessions.findMany({
                where: (cs, { or, and, gte, lte }) => or(
                    // Show sessions visible in this week
                    and(gte(cs.date, startDate), lte(cs.date, endDate)),
                    // AND track sessions that SHOULD have been in this week (to prevent dupes)
                    and(gte(cs.templateDate, startDate), lte(cs.templateDate, endDate))
                ),
                with: { course: true },
            });

            // 3. Lazy Generation Logic
            // Fetch configuration
            const holidays = await db.query.academicEvents.findMany({
                where: (evt, { and, lte, gte, inArray }) => and(
                    lte(evt.startDate, endDate),
                    gte(evt.endDate, startDate),
                    inArray(evt.type, ["break", "holiday"])
                )
            });

            const templates = await db.query.timetableTemplates.findMany({
                with: { course: true }
            });

            const sessionsToCreate: any[] = [];
            const currentDate = new Date(startDate);
            const endDateLoop = new Date(endDate);

            while (currentDate <= endDateLoop) {
                const isHoliday = holidays.some(h =>
                    currentDate >= h.startDate && currentDate <= h.endDate
                );

                if (!isHoliday) {
                    const dayOfWeek = currentDate.getDay().toString();
                    // Match templates by day AND active semester
                    const dailyTemplates = templates.filter(t =>
                        t.dayOfWeek === dayOfWeek
                        // Ensure template belongs to a course in an active semester
                        // (Assuming course.semester is just a label or we check ID match if possible)
                        // For now, simpler check: rely on template existence.
                    );

                    for (const tmpl of dailyTemplates) {
                        // Check if session exists for this "template slot"
                        // Key: generatedFromTemplateId + templateDate
                        const exists = existingSessions.some(s =>
                            s.generatedFromTemplateId === tmpl.id &&
                            s.templateDate &&
                            s.templateDate.toDateString() === currentDate.toDateString()
                        );

                        if (!exists) {
                            // Determine Semester ID (Critical for new sessions)
                            // We need to link to a semester.
                            // Try to match course's semester? Or use the first active semester found?
                            // Ideally `courses` table should have `semesterId`.
                            // Fallback: Use the first active semester.
                            const semesterId = activeSemesters[0]?.id; // Improve this!

                            if (semesterId) {
                                sessionsToCreate.push({
                                    courseId: tmpl.courseId,
                                    semesterId: semesterId,
                                    date: new Date(currentDate),
                                    startTime: tmpl.startTime,
                                    endTime: tmpl.endTime,
                                    location: tmpl.location,
                                    type: "regular",
                                    status: "scheduled",
                                    generatedFromTemplateId: tmpl.id,
                                    templateDate: new Date(currentDate),
                                });
                            }
                        }
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // 4. Bulk Insert & Return
            if (sessionsToCreate.length > 0) {
                // We use db.insert(...).values(...) 
                // We need to import 'classSessions' table definition clearly
                // Drizzle insert returns result?
                await db.insert(classSessions).values(sessionsToCreate);

                // Refetch to get IDs and joined data (course)
                return await db.query.classSessions.findMany({
                    where: (cs, { and, gte, lte }) => and(
                        gte(cs.date, startDate),
                        lte(cs.date, endDate)
                    ),
                    with: { course: true },
                    orderBy: (cs, { asc }) => [asc(cs.date), asc(cs.startTime)]
                });
            }

            // Return filtered list (exclude sessions moved OUT of this week)
            return existingSessions
                .filter(s => s.date >= startDate && s.date <= endDate)
                .sort((a, b) => a.date.getTime() - b.date.getTime());
        }),
});

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), "apps/web/.env") });

import { eq, and, lte, gte, or, isNull } from "drizzle-orm";

async function migrate() {
    console.log("Starting migration...");
    const { db, classSessions, extraClasses, classExceptions, timetableTemplates, semesters } = await import("../src");

    // 1. Migrate Extra Classes
    const extras = await db.query.extraClasses.findMany();
    console.log(`Found ${extras.length} extra classes.`);

    for (const extra of extras) {
        // Find active semester
        const semester = await db.query.semesters.findFirst({
            where: (sem, { and, lte, gte, or, isNull }) => and(
                lte(sem.startDate, extra.date),
                or(isNull(sem.endDate), gte(sem.endDate, extra.date))
            )
        });

        if (semester) {
            await db.insert(classSessions).values({
                courseId: extra.courseId,
                semesterId: semester.id,
                date: extra.date,
                startTime: extra.startTime,
                endTime: extra.endTime,
                location: extra.location,
                type: "extra",
                status: "scheduled",
                note: extra.reason,
                createdByUserId: extra.createdByUserId,
                createdAt: extra.createdAt,
            });
        } else {
            console.warn(`Skipping extra class ${extra.id}: No active semester found for ${extra.date}`);
        }
    }

    // 2. Migrate Exceptions
    const exceptions = await db.query.classExceptions.findMany();
    console.log(`Found ${exceptions.length} exceptions.`);

    const templates = await db.query.timetableTemplates.findMany();

    for (const ex of exceptions) {
        const date = new Date(ex.originalDate);
        const dayOfWeek = date.getDay().toString();

        // Find matching template(s)
        const relevantTemplates = templates.filter(t =>
            t.courseId === ex.courseId &&
            t.dayOfWeek === dayOfWeek
            // If originalDate includes time, match it?
            // Assuming ex.originalDate is just the day or matches start time?
            // Let's assume generic day match for now.
        );

        if (relevantTemplates.length === 0) {
            console.warn(`No template found for exception ${ex.id} (Course ${ex.courseId} on ${date})`);
            continue;
        }

        // Find active semester
        const semester = await db.query.semesters.findFirst({
            where: (sem, { and, lte, gte, or, isNull }) => and(
                lte(sem.startDate, date),
                or(isNull(sem.endDate), gte(sem.endDate, date))
            )
        });

        if (!semester) {
            console.warn(`No semester for exception ${ex.id}`);
            continue;
        }

        for (const tmpl of relevantTemplates) {
            // Check if session exists (maybe created by previous migration step or lazy gen?)
            // We need to UPSERT basically.
            // Try to find existing session.
            const existing = await db.query.classSessions.findFirst({
                where: (cs, { and, eq }) => and(
                    eq(cs.generatedFromTemplateId, tmpl.id),
                    eq(cs.templateDate, date) // Precise match
                )
            });

            if (existing) {
                // Update it
                if (ex.type === "cancelled") {
                    await db.update(classSessions)
                        .set({ status: "cancelled", cancelReason: ex.reason })
                        .where(eq(classSessions.id, existing.id));
                } else if (ex.type === "rescheduled") {
                    if (ex.newDate && ex.newStartTime && ex.newEndTime) {
                        await db.update(classSessions)
                            .set({
                                date: ex.newDate,
                                startTime: ex.newStartTime,
                                endTime: ex.newEndTime,
                                status: "scheduled"
                            })
                            .where(eq(classSessions.id, existing.id));
                    }
                }
            } else {
                // Create it with the exception applied
                if (ex.type === "cancelled") {
                    await db.insert(classSessions).values({
                        courseId: tmpl.courseId,
                        semesterId: semester.id,
                        date: date,
                        startTime: tmpl.startTime,
                        endTime: tmpl.endTime,
                        location: tmpl.location,
                        type: "regular",
                        status: "cancelled",
                        cancelReason: ex.reason,
                        generatedFromTemplateId: tmpl.id,
                        templateDate: date,
                        createdByUserId: ex.createdByUserId,
                    });
                } else if (ex.type === "rescheduled") {
                    if (ex.newDate && ex.newStartTime && ex.newEndTime) {
                        await db.insert(classSessions).values({
                            courseId: tmpl.courseId,
                            semesterId: semester.id,
                            date: ex.newDate,
                            startTime: ex.newStartTime,
                            endTime: ex.newEndTime,
                            location: tmpl.location,
                            type: "regular",
                            status: "scheduled",
                            generatedFromTemplateId: tmpl.id,
                            templateDate: date, // Keep original date as template anchor
                            createdByUserId: ex.createdByUserId,
                        });
                    }
                }
            }
        }
    }

    console.log("Migration complete.");
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});

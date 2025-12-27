import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courses } from "./courses";
import { user } from "./auth";
import { attachments } from "./attachments";

// Note types based on mock data: 'PDF' | 'Slides' | 'Lab Manual' | 'Reference' | 'Link' | 'Lecture Notes'
// Ideally an enum or just text. Let's use enum for structure.
export const noteTypeEnum = pgEnum("note_type", ["PDF", "Slides", "Lab Manual", "Reference", "Link", "Lecture Notes"]);

export const notes = pgTable("notes", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    courseId: uuid("course_id")
        .notNull()
        .references(() => courses.id, { onDelete: "cascade" }),
    type: noteTypeEnum("type").notNull(),
    week: text("week"), // Optional "Week 1", "Week 2" grouping
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const notesRelations = relations(notes, ({ one, many }) => ({
    course: one(courses, {
        fields: [notes.courseId],
        references: [courses.id],
    }),
    author: one(user, {
        fields: [notes.createdBy],
        references: [user.id],
    }),
    attachments: many(attachments),
}));

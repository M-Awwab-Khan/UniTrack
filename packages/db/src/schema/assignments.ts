import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courses } from "./courses";
import { user } from "./auth";

export const assignmentTypeEnum = pgEnum("assignment_type", ["Lab", "Assignment", "Quiz", "Project", "Presentation"]);

export const assignments = pgTable("assignments", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    courseId: uuid("course_id")
        .notNull()
        .references(() => courses.id, { onDelete: "cascade" }),
    type: assignmentTypeEnum("type").notNull(),
    dueDate: timestamp("due_date").notNull(),
    instructions: text("instructions"), // Optional rich text instructions
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }), // Keep content if user deleted? Or cascade? "cascade" safer for cleanup, "set null" preserves history. Let's stick to "cascade" for simplicity as per other tables, or actually set null if we want to keep academic records. User deletion is soft anyway usually. Let's use cascade for consistency with valid FKs. Wait, schema plan said "created_by FK -> user.id".
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const assignmentsRelations = relations(assignments, ({ one }) => ({
    course: one(courses, {
        fields: [assignments.courseId],
        references: [courses.id],
    }),
    author: one(user, {
        fields: [assignments.createdBy],
        references: [user.id],
    }),
}));

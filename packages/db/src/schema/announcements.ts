import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courses } from "./courses";
import { user } from "./auth";

export const priorityEnum = pgEnum("announcement_priority", ["Normal", "Important"]);

export const announcements = pgTable("announcements", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    courseId: uuid("course_id")
        .notNull()
        .references(() => courses.id, { onDelete: "cascade" }),
    priority: priorityEnum("priority").default("Normal").notNull(),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const announcementsRelations = relations(announcements, ({ one }) => ({
    course: one(courses, {
        fields: [announcements.courseId],
        references: [courses.id],
    }),
    author: one(user, {
        fields: [announcements.createdBy],
        references: [user.id],
    }),
}));

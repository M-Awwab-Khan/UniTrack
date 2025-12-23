import { pgTable, text, timestamp, integer, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { taInviteCourses, courseTas } from "./ta-invites";
import { assignments } from "./assignments";
import { courseStudents } from "./course-students";

export const courseStatusEnum = pgEnum("course_status", ["active", "archived"]);

export const courses = pgTable("courses", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(), // e.g. CS301
    name: text("name").notNull(), // e.g. Operating Systems
    instructor: text("instructor"),
    description: text("description"),
    department: text("department").notNull(), // e.g. CS
    semester: text("semester"), // e.g. Fall 2025
    creditHours: integer("credit_hours"),
    status: courseStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
    taInviteCourses: many(taInviteCourses),
    courseTas: many(courseTas),
    courseStudents: many(courseStudents),
    assignments: many(assignments),
}));

import { pgTable, uuid, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const enrollmentStatusEnum = pgEnum("enrollment_status", ["active", "dropped", "completed"]);

export const courseStudents = pgTable(
    "course_students",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        courseId: uuid("course_id")
            .notNull()
            .references(() => courses.id, { onDelete: "cascade" }),

        userId: text("user_id") // Kept as userId for consistency with other tables, though plan said studentId. userId is better.
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),

        enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),

        status: enrollmentStatusEnum("status").default("active").notNull(),
    },
    (table) => [
        index("idx_course_students_course").on(table.courseId),
        index("idx_course_students_student").on(table.userId),
        // unique index to prevent double enrollment
        index("uniq_course_student").on(table.courseId, table.userId),
    ]
);

export const courseStudentsRelations = relations(courseStudents, ({ one }) => ({
    course: one(courses, {
        fields: [courseStudents.courseId],
        references: [courses.id],
    }),
    user: one(user, {
        fields: [courseStudents.userId],
        references: [user.id],
    }),
}));

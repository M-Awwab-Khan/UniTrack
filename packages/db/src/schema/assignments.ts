import { pgTable, text, timestamp, uuid, pgEnum, boolean, integer, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courses } from "./courses";
import { user } from "./auth";
import { attachments } from "./attachments";

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


export const assignmentSubmissions = pgTable("assignment_submissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
        .notNull()
        .references(() => assignments.id, { onDelete: "cascade" }),
    studentId: text("student_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    submissionText: text("submission_text"),
    fileUrl: text("file_url"),
    isLate: boolean("is_late").notNull().default(false),
    attemptNumber: integer("attempt_number").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (t) => ({
    uniqueSubmission: uniqueIndex("unique_assignment_submission").on(t.assignmentId, t.studentId),
    assignmentIdx: index("idx_submission_assignment").on(t.assignmentId),
    studentIdx: index("idx_submission_student").on(t.studentId),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
    course: one(courses, {
        fields: [assignments.courseId],
        references: [courses.id],
    }),
    author: one(user, {
        fields: [assignments.createdBy],
        references: [user.id],
    }),
    submissions: many(assignmentSubmissions),
    attachments: many(attachments),
}));


export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
    assignment: one(assignments, {
        fields: [assignmentSubmissions.assignmentId],
        references: [assignments.id],
    }),
    student: one(user, {
        fields: [assignmentSubmissions.studentId],
        references: [user.id],
    }),
}));

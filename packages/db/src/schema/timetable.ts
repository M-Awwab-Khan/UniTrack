import { pgTable, text, timestamp, pgEnum, uuid, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { courses } from "./courses";

// Enums
export const semesterStatusEnum = pgEnum("semester_status", ["active", "archived"]);
export const classTypeEnum = pgEnum("class_type", ["regular", "extra", "compensatory"]);
export const exceptionTypeEnum = pgEnum("exception_type", ["cancelled", "rescheduled"]);
export const academicEventTypeEnum = pgEnum("academic_event_type", ["break", "holiday", "exam", "event"]);

// Semesters Table
export const semesters = pgTable("semesters", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(), // e.g. "Spring 2025"
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"), // Optional end date
    status: semesterStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Timetable Templates (Weekly Recurring)
export const timetableTemplates = pgTable("timetable_templates", {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    dayOfWeek: text("day_of_week").notNull(), // 0-6 or "monday", "tuesday" etc. storing as string for flexibility, or could use int
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    location: text("location").notNull(),
    createdByAdminId: text("created_by_admin_id").notNull().references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Class Exceptions (Cancellations, Rescheduling)
export const classExceptions = pgTable("class_exceptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    originalDate: timestamp("original_date").notNull(), // The date of the class being modified
    type: exceptionTypeEnum("type").notNull(),
    reason: text("reason"),
    newDate: timestamp("new_date"), // If rescheduled
    newStartTime: time("new_start_time"), // If rescheduled
    newEndTime: time("new_end_time"), // If rescheduled
    createdByUserId: text("created_by_user_id").notNull().references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Extra Classes (Compensatory or Additional)
export const extraClasses = pgTable("extra_classes", {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    location: text("location").notNull(),
    reason: text("reason"),
    type: classTypeEnum("type").default("extra").notNull(),
    createdByUserId: text("created_by_user_id").notNull().references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Academic Calendar Events (Breaks, Holidays)
export const academicEvents = pgTable("academic_events", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    type: academicEventTypeEnum("type").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    description: text("description"),
    createdByAdminId: text("created_by_admin_id").notNull().references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const timetableTemplatesRelations = relations(timetableTemplates, ({ one }) => ({
    course: one(courses, {
        fields: [timetableTemplates.courseId],
        references: [courses.id],
    }),
    creator: one(user, {
        fields: [timetableTemplates.createdByAdminId],
        references: [user.id],
    }),
}));

export const classExceptionsRelations = relations(classExceptions, ({ one }) => ({
    course: one(courses, {
        fields: [classExceptions.courseId],
        references: [courses.id],
    }),
    creator: one(user, {
        fields: [classExceptions.createdByUserId],
        references: [user.id],
    }),
}));

export const extraClassesRelations = relations(extraClasses, ({ one }) => ({
    course: one(courses, {
        fields: [extraClasses.courseId],
        references: [courses.id],
    }),
    creator: one(user, {
        fields: [extraClasses.createdByUserId],
        references: [user.id],
    }),
}));

export const academicEventsRelations = relations(academicEvents, ({ one }) => ({
    creator: one(user, {
        fields: [academicEvents.createdByAdminId],
        references: [user.id],
    }),
}));

// --- NEW ARCHITECTURE: Unified Class Sessions ---
export const sessionStatusEnum = pgEnum("session_status", ["scheduled", "conducted", "cancelled"]);

export const classSessions = pgTable("class_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    semesterId: uuid("semester_id").notNull().references(() => semesters.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    location: text("location").notNull(),
    type: classTypeEnum("type").default("regular").notNull(),
    status: sessionStatusEnum("status").default("scheduled").notNull(),
    generatedFromTemplateId: uuid("generated_from_template_id").references(() => timetableTemplates.id),
    templateDate: timestamp("template_date"), // Essential for lazy gen identity
    cancelReason: text("cancel_reason"),
    note: text("note"), // Generic notes (e.g. for extra classes)
    createdByUserId: text("created_by_user_id").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classSessionsRelations = relations(classSessions, ({ one }) => ({
    course: one(courses, {
        fields: [classSessions.courseId],
        references: [courses.id],
    }),
    semester: one(semesters, {
        fields: [classSessions.semesterId],
        references: [semesters.id],
    }),
    template: one(timetableTemplates, {
        fields: [classSessions.generatedFromTemplateId],
        references: [timetableTemplates.id],
    }),
}));

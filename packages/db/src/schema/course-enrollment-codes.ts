import { pgTable, uuid, text, boolean, timestamp, integer, index } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const courseEnrollmentCodes = pgTable(
    "course_enrollment_codes",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        courseId: uuid("course_id")
            .notNull()
            .references(() => courses.id, { onDelete: "cascade" }),

        code: text("code").notNull().unique(), // e.g. SE-OS-7F9K

        isActive: boolean("is_active").default(true).notNull(),

        maxUses: integer("max_uses"), // Nullable = unlimited

        uses: integer("uses").default(0).notNull(),

        expiresAt: timestamp("expires_at"), // optional

        createdByAdminId: text("created_by_admin_id")
            .references(() => user.id),

        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("idx_enrollment_code_course").on(table.courseId),
        index("idx_enrollment_code_active").on(table.isActive),
    ]
);

export const courseEnrollmentCodesRelations = relations(courseEnrollmentCodes, ({ one }) => ({
    course: one(courses, {
        fields: [courseEnrollmentCodes.courseId],
        references: [courses.id],
    }),
    createdBy: one(user, {
        fields: [courseEnrollmentCodes.createdByAdminId],
        references: [user.id],
    }),
}));

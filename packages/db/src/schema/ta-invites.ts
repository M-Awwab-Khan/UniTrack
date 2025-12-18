import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, pgEnum, uuid, index, primaryKey } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Status enum for TA invites
export const inviteStatusEnum = pgEnum("invite_status", ["active", "used", "expired", "revoked"]);

import { courses } from "./courses";

// TA Invites table
export const taInvites = pgTable(
    "ta_invites",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        fullName: text("full_name").notNull(),
        email: text("email").notNull(),
        department: text("department").notNull(),
        inviteCode: text("invite_code").notNull().unique(),
        createdByAdminId: text("created_by_admin_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        expiresAt: timestamp("expires_at").notNull(),
        usedAt: timestamp("used_at"),
        status: inviteStatusEnum("status").default("active").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("ta_invites_invite_code_idx").on(table.inviteCode),
        index("ta_invites_email_idx").on(table.email),
        index("ta_invites_status_idx").on(table.status),
    ]
);

// Junction table for TA invite courses
export const taInviteCourses = pgTable(
    "ta_invite_courses",
    {
        inviteId: uuid("invite_id")
            .notNull()
            .references(() => taInvites.id, { onDelete: "cascade" }),
        courseId: uuid("course_id")
            .notNull()
            .references(() => courses.id, { onDelete: "cascade" }),
    },
    (table) => [primaryKey({ columns: [table.inviteId, table.courseId] })]
);

// TA Permissions table
export const taPermissions = pgTable(
    "ta_permissions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        inviteId: uuid("invite_id")
            .notNull()
            .references(() => taInvites.id, { onDelete: "cascade" }),
        permission: text("permission").notNull(),
    },
    (table) => [index("ta_permissions_invite_id_idx").on(table.inviteId)]
);

// Course TAs table (after registration)
export const courseTas = pgTable(
    "course_tas",
    {
        taId: text("ta_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        courseId: uuid("course_id")
            .notNull()
            .references(() => courses.id, { onDelete: "cascade" }),
        assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.taId, table.courseId] })]
);

// Relations


export const taInvitesRelations = relations(taInvites, ({ one, many }) => ({
    createdBy: one(user, {
        fields: [taInvites.createdByAdminId],
        references: [user.id],
    }),
    courses: many(taInviteCourses),
    permissions: many(taPermissions),
}));

export const taInviteCoursesRelations = relations(taInviteCourses, ({ one }) => ({
    invite: one(taInvites, {
        fields: [taInviteCourses.inviteId],
        references: [taInvites.id],
    }),
    course: one(courses, {
        fields: [taInviteCourses.courseId],
        references: [courses.id],
    }),
}));

export const taPermissionsRelations = relations(taPermissions, ({ one }) => ({
    invite: one(taInvites, {
        fields: [taPermissions.inviteId],
        references: [taInvites.id],
    }),
}));

export const courseTasRelations = relations(courseTas, ({ one }) => ({
    ta: one(user, {
        fields: [courseTas.taId],
        references: [user.id],
    }),
    course: one(courses, {
        fields: [courseTas.courseId],
        references: [courses.id],
    }),
}));

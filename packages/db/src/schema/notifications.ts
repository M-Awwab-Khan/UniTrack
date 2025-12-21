import { pgTable, text, boolean, timestamp, pgEnum, uuid, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const notificationRoleEnum = pgEnum("notification_role", ["student", "ta", "teacher", "admin", "all"]);
export const notificationTypeEnum = pgEnum("notification_type", ["assignment", "announcement", "timetable", "note", "invite", "system"]);
export const notificationPriorityEnum = pgEnum("notification_priority", ["normal", "important"]);

export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }), // Nullable for role-based
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: notificationTypeEnum("type").notNull(),
    entityType: text("entity_type"), // e.g. "assignment"
    entityId: text("entity_id"),     // e.g. UUID
    priority: notificationPriorityEnum("priority").default("normal").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("idx_notifications_user_is_read").on(table.userId, table.isRead),
    index("idx_notifications_created_at").on(table.createdAt),
]);

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(user, {
        fields: [notifications.userId],
        references: [user.id],
    }),
}));

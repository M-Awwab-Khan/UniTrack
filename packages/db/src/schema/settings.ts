import { pgTable, text, boolean, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);
export const defaultPageEnum = pgEnum("default_page", ["dashboard", "assignments", "timetable"]);
export const timeFormatEnum = pgEnum("time_format", ["12h", "24h"]);
export const weekStartEnum = pgEnum("week_start", ["monday", "sunday"]);

export const userPreferences = pgTable("user_preferences", {
    userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
    theme: themeEnum("theme").default("system").notNull(),
    defaultPage: defaultPageEnum("default_page").default("dashboard").notNull(),
    timeFormat: timeFormatEnum("time_format").default("12h").notNull(),
    weekStart: weekStartEnum("week_start").default("monday").notNull(),
});

export const reminderTimingEnum = pgEnum("reminder_timing", ["3_days", "1_day", "same_day"]);

export const notificationSettings = pgTable("notification_settings", {
    userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
    assignmentReminders: boolean("assignment_reminders").default(true).notNull(),
    announcementNotifications: boolean("announcement_notifications").default(true).notNull(),
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    reminderTiming: reminderTimingEnum("reminder_timing").default("1_day").notNull(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
    user: one(user, {
        fields: [userPreferences.userId],
        references: [user.id],
    }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
    user: one(user, {
        fields: [notificationSettings.userId],
        references: [user.id],
    }),
}));

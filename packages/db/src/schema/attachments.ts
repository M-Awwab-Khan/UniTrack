import { pgTable, text, timestamp, uuid, pgEnum, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assignments } from "./assignments";
import { announcements } from "./announcements";
import { notes } from "./notes";

export const attachmentTypeEnum = pgEnum("attachment_type", ["file", "link"]);

export const attachments = pgTable("attachments", {
    id: uuid("id").primaryKey().defaultRandom(),
    type: attachmentTypeEnum("type").notNull(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    publicId: text("public_id"), // Nullable, only for files
    fileSize: integer("file_size"), // Nullable, only for files
    mimeType: text("mime_type"), // Nullable, only for files

    // Foreign Keys (Nullable to allow polymorphism)
    assignmentId: uuid("assignment_id")
        .references(() => assignments.id, { onDelete: "cascade" }),
    announcementId: uuid("announcement_id")
        .references(() => announcements.id, { onDelete: "cascade" }),
    noteId: uuid("note_id")
        .references(() => notes.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attachmentsRelations = relations(attachments, ({ one }) => ({
    assignment: one(assignments, {
        fields: [attachments.assignmentId],
        references: [assignments.id],
    }),
    announcement: one(announcements, {
        fields: [attachments.announcementId],
        references: [announcements.id],
    }),
    note: one(notes, {
        fields: [attachments.noteId],
        references: [notes.id],
    }),
}));

import { db } from "@uni-track/db";
import { notifications } from "@uni-track/db/schema";

type NotificationInput = {
    userId: string[];
    roleTarget?: "student" | "ta" | "teacher" | "admin" | "all";
    title: string;
    message: string;
    type: "assignment" | "announcement" | "timetable" | "note" | "invite" | "system";
    entityType?: string;
    entityId?: string;
    priority?: "normal" | "important";
};

/**
 * Creates a notification.
 * Handles logic for targeting specific users or broadcasting to roles.
 * Currently, we persist the roleTarget directly for role-based queries.
 * For more granular 'all students in course', we might need to explode this into individual user notifications
 * here or use a many-to-many relation. For now, we support direct ID or Role broadcast.
 */
export async function createNotification(input: NotificationInput) {
    // Validation: Must have either userId or roleTarget
    if (!input.userId && !input.roleTarget) {
        throw new Error("Notification must target a user or a role.");
    }

    await db.insert(notifications).values(
        input.userId.map((userId) => ({
            userId,
            title: input.title,
            message: input.message,
            type: input.type,
            entityType: input.entityType,
            entityId: input.entityId,
            priority: input.priority || "normal",
        }))
    );
}

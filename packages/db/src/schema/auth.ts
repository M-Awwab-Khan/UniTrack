import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "ta", "teacher", "admin"]);

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	role: roleEnum("role").default("student").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Profiles

export const studentProfile = pgTable("student_profile", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	rollNumber: text("roll_number").notNull(),
	department: text("department").notNull(),
	semester: text("semester").notNull(),
	batch: text("batch").notNull(),
});

export const taProfile = pgTable("ta_profile", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	department: text("department").notNull(),
});

export const teacherProfile = pgTable("teacher_profile", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	department: text("department").notNull(),
});

export const adminProfile = pgTable("admin_profile", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

// Relations

export const userRelations = relations(user, ({ many, one }) => ({
	sessions: many(session),
	accounts: many(account),
	studentProfile: one(studentProfile, {
		fields: [user.id],
		references: [studentProfile.userId],
	}),
	taProfile: one(taProfile, {
		fields: [user.id],
		references: [taProfile.userId],
	}),
	teacherProfile: one(teacherProfile, {
		fields: [user.id],
		references: [teacherProfile.userId],
	}),
	adminProfile: one(adminProfile, {
		fields: [user.id],
		references: [adminProfile.userId],
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const studentProfileRelations = relations(studentProfile, ({ one }) => ({
	user: one(user, {
		fields: [studentProfile.userId],
		references: [user.id],
	}),
}));

export const taProfileRelations = relations(taProfile, ({ one }) => ({
	user: one(user, {
		fields: [taProfile.userId],
		references: [user.id],
	}),
}));

export const teacherProfileRelations = relations(teacherProfile, ({ one }) => ({
	user: one(user, {
		fields: [teacherProfile.userId],
		references: [user.id],
	}),
}));

export const adminProfileRelations = relations(adminProfile, ({ one }) => ({
	user: one(user, {
		fields: [adminProfile.userId],
		references: [user.id],
	}),
}));

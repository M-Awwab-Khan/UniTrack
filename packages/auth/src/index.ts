import { nextCookies } from 'better-auth/next-js';
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@uni-track/db";
import * as schema from "@uni-track/db/schema/auth";

export const auth = betterAuth({
	user: {
		additionalFields: {
			role: {
				type: "string",
			},
		},
	},
	session: {
		additionalFields: {
			role: {
				type: "string",
			},
		},
	},
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
	plugins: [nextCookies()]
});

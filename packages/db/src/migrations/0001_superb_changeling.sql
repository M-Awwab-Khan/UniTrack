CREATE TYPE "public"."invite_status" AS ENUM('active', 'used', 'expired', 'revoked');--> statement-breakpoint
CREATE TABLE "course_tas" (
	"ta_id" text NOT NULL,
	"course_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_tas_ta_id_course_id_pk" PRIMARY KEY("ta_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"department" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ta_invite_courses" (
	"invite_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	CONSTRAINT "ta_invite_courses_invite_id_course_id_pk" PRIMARY KEY("invite_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "ta_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"department" text NOT NULL,
	"invite_code" text NOT NULL,
	"created_by_admin_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"status" "invite_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ta_invites_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "ta_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"permission" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_tas" ADD CONSTRAINT "course_tas_ta_id_user_id_fk" FOREIGN KEY ("ta_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_tas" ADD CONSTRAINT "course_tas_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ta_invite_courses" ADD CONSTRAINT "ta_invite_courses_invite_id_ta_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."ta_invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ta_invite_courses" ADD CONSTRAINT "ta_invite_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ta_invites" ADD CONSTRAINT "ta_invites_created_by_admin_id_user_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ta_permissions" ADD CONSTRAINT "ta_permissions_invite_id_ta_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."ta_invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ta_invites_invite_code_idx" ON "ta_invites" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "ta_invites_email_idx" ON "ta_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX "ta_invites_status_idx" ON "ta_invites" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ta_permissions_invite_id_idx" ON "ta_permissions" USING btree ("invite_id");
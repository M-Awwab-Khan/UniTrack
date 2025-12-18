CREATE TYPE "public"."course_status" AS ENUM('active', 'archived');--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "semester" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "credit_hours" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "status" "course_status" DEFAULT 'active' NOT NULL;
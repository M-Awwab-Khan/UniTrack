CREATE TYPE "public"."notification_priority" AS ENUM('normal', 'important');--> statement-breakpoint
CREATE TYPE "public"."notification_role" AS ENUM('student', 'ta', 'teacher', 'admin', 'all');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('assignment', 'announcement', 'timetable', 'note', 'invite', 'system');--> statement-breakpoint
CREATE TABLE "course_students" (
	"course_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "course_students_course_id_user_id_pk" PRIMARY KEY("course_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"priority" "notification_priority" DEFAULT 'normal' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_students" ADD CONSTRAINT "course_students_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_students" ADD CONSTRAINT "course_students_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_course_students_user" ON "course_students" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_course_students_course" ON "course_students" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_is_read" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at");
CREATE TYPE "public"."academic_event_type" AS ENUM('break', 'holiday', 'exam', 'event');--> statement-breakpoint
CREATE TYPE "public"."class_type" AS ENUM('regular', 'extra', 'compensatory');--> statement-breakpoint
CREATE TYPE "public"."exception_type" AS ENUM('cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."semester_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TABLE "academic_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" "academic_event_type" NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"description" text,
	"created_by_admin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"original_date" timestamp NOT NULL,
	"type" "exception_type" NOT NULL,
	"reason" text,
	"new_date" timestamp,
	"new_start_time" time,
	"new_end_time" time,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extra_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"location" text NOT NULL,
	"reason" text,
	"type" "class_type" DEFAULT 'extra' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "semesters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" "semester_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"day_of_week" text NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"location" text NOT NULL,
	"created_by_admin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academic_events" ADD CONSTRAINT "academic_events_created_by_admin_id_user_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_exceptions" ADD CONSTRAINT "class_exceptions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_exceptions" ADD CONSTRAINT "class_exceptions_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extra_classes" ADD CONSTRAINT "extra_classes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extra_classes" ADD CONSTRAINT "extra_classes_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_templates" ADD CONSTRAINT "timetable_templates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_templates" ADD CONSTRAINT "timetable_templates_created_by_admin_id_user_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
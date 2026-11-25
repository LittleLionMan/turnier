ALTER TABLE "registration" ADD COLUMN "guest_adults" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "registration" ADD COLUMN "guest_children" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "registration" ADD COLUMN "guest_preferences" jsonb DEFAULT '{"adults":[],"children":[]}'::jsonb NOT NULL;
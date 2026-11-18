ALTER TABLE "event" ADD COLUMN "payment_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "helper_role" ADD COLUMN "exempts_from_fee" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "helper_role" ADD COLUMN "max_count" integer;
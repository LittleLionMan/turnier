CREATE TYPE "public"."contact_method" AS ENUM('anruf', 'nachricht', 'persoenlich', 'social_media');--> statement-breakpoint
CREATE TYPE "public"."prospect_status" AS ENUM('vorgeschlagen', 'offen', 'informiert', 'angemeldet');--> statement-breakpoint
CREATE TABLE "prospect" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"name" text NOT NULL,
	"hint" text,
	"status" "prospect_status" DEFAULT 'vorgeschlagen' NOT NULL,
	"suggested_by_id" text,
	"informed_by_id" text,
	"contact_method" "contact_method",
	"contact_note" text,
	"informed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prospect" ADD CONSTRAINT "prospect_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospect" ADD CONSTRAINT "prospect_suggested_by_id_user_id_fk" FOREIGN KEY ("suggested_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospect" ADD CONSTRAINT "prospect_informed_by_id_user_id_fk" FOREIGN KEY ("informed_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
CREATE TYPE "public"."food_choice" AS ENUM('fleisch', 'vegetarisch', 'vegan');--> statement-breakpoint
ALTER TABLE "registration" ADD COLUMN "food_choice" "food_choice";--> statement-breakpoint
ALTER TABLE "registration" ADD COLUMN "drink_choices" text[] DEFAULT '{}' NOT NULL;
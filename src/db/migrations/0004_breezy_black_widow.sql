ALTER TABLE "tenants" ADD COLUMN "primary_color" text DEFAULT '#f59e0b' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "display_name" text;
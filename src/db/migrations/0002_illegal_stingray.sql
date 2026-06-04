CREATE TABLE "prebatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"category_id" uuid,
	"name" text NOT NULL,
	"production_date" timestamp DEFAULT now() NOT NULL,
	"expiration_date" timestamp,
	"initial_quantity_ml" double precision NOT NULL,
	"current_quantity_ml" double precision NOT NULL,
	"batch_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prebatches" ADD CONSTRAINT "prebatches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prebatches" ADD CONSTRAINT "prebatches_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
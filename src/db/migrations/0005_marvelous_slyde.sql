ALTER TABLE "bar_configs" ADD COLUMN "allow_staff_stock_adjust" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bar_configs" ADD COLUMN "allow_cashier_keg_manage" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bar_configs" ADD COLUMN "allow_kitchen_view_sales" boolean DEFAULT false NOT NULL;
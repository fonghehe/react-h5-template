CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_zh" text NOT NULL,
	"title_en" text NOT NULL,
	"title_ja" text NOT NULL,
	"image_url" text NOT NULL,
	"price" integer NOT NULL,
	"member_price" integer NOT NULL,
	"shop_name" varchar(160) NOT NULL,
	"shop_badge" varchar(40) NOT NULL,
	"delivery" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL,
	"password_hash" text NOT NULL,
	"real_name" varchar(120) NOT NULL,
	"avatar" text NOT NULL,
	"roles" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX "products_sort_order_idx" ON "products" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");
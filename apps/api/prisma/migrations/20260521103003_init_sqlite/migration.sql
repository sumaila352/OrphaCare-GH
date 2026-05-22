-- CreateTable
CREATE TABLE "roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    PRIMARY KEY ("user_id", "role_id"),
    CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "used_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "children" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT NOT NULL,
    "date_of_birth" DATETIME,
    "gender" TEXT,
    "admission_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "photo_url" TEXT,
    "photo_public_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME
);

-- CreateTable
CREATE TABLE "staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "position" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "staff_id" INTEGER NOT NULL,
    "attend_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendance_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "donors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME,
    CONSTRAINT "donors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "donations" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "donor_id" INTEGER,
    "type" TEXT NOT NULL,
    "amount" DECIMAL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "reference" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "donation_items" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "donation_id" BIGINT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL DEFAULT 1,
    "unit" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "donation_items_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "donations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "quantity" DECIMAL NOT NULL DEFAULT 0,
    "unit" TEXT,
    "low_stock_threshold" DECIMAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "item_id" INTEGER NOT NULL,
    "movement_type" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "reason" TEXT,
    "created_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "actor_user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "meta" JSONB,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "password_resets_user_id_idx" ON "password_resets"("user_id");

-- CreateIndex
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "children_status_idx" ON "children"("status");

-- CreateIndex
CREATE INDEX "children_deleted_at_idx" ON "children"("deleted_at");

-- CreateIndex
CREATE INDEX "staff_status_idx" ON "staff"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_staff_id_attend_date_key" ON "attendance"("staff_id", "attend_date");

-- CreateIndex
CREATE INDEX "donors_user_id_idx" ON "donors"("user_id");

-- CreateIndex
CREATE INDEX "donations_created_at_idx" ON "donations"("created_at");

-- CreateIndex
CREATE INDEX "donations_donor_id_idx" ON "donations"("donor_id");

-- CreateIndex
CREATE INDEX "donation_items_donation_id_idx" ON "donation_items"("donation_id");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE INDEX "stock_movements_item_id_idx" ON "stock_movements"("item_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

/*
  Warnings:

  - The primary key for the `attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `attendance` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `donation_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `donation_id` on the `donation_items` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `donation_items` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `donations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `donations` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `password_resets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `password_resets` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `stock_movements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staff_id" INTEGER NOT NULL,
    "attend_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendance_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_attendance" ("attend_date", "created_at", "id", "staff_id", "status") SELECT "attend_date", "created_at", "id", "staff_id", "status" FROM "attendance";
DROP TABLE "attendance";
ALTER TABLE "new_attendance" RENAME TO "attendance";
CREATE UNIQUE INDEX "attendance_staff_id_attend_date_key" ON "attendance"("staff_id", "attend_date");
CREATE TABLE "new_audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actor_user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "meta" JSONB,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_audit_logs" ("action", "actor_user_id", "created_at", "entity_id", "entity_type", "id", "ip_address", "meta") SELECT "action", "actor_user_id", "created_at", "entity_id", "entity_type", "id", "ip_address", "meta" FROM "audit_logs";
DROP TABLE "audit_logs";
ALTER TABLE "new_audit_logs" RENAME TO "audit_logs";
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
CREATE TABLE "new_donation_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "donation_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL DEFAULT 1,
    "unit" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "donation_items_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "donations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_donation_items" ("created_at", "donation_id", "id", "item_name", "quantity", "unit") SELECT "created_at", "donation_id", "id", "item_name", "quantity", "unit" FROM "donation_items";
DROP TABLE "donation_items";
ALTER TABLE "new_donation_items" RENAME TO "donation_items";
CREATE INDEX "donation_items_donation_id_idx" ON "donation_items"("donation_id");
CREATE TABLE "new_donations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "donor_id" INTEGER,
    "type" TEXT NOT NULL,
    "amount" DECIMAL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "reference" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_donations" ("amount", "created_at", "currency", "donor_id", "id", "notes", "reference", "type") SELECT "amount", "created_at", "currency", "donor_id", "id", "notes", "reference", "type" FROM "donations";
DROP TABLE "donations";
ALTER TABLE "new_donations" RENAME TO "donations";
CREATE INDEX "donations_created_at_idx" ON "donations"("created_at");
CREATE INDEX "donations_donor_id_idx" ON "donations"("donor_id");
CREATE TABLE "new_password_resets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "used_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_password_resets" ("created_at", "expires_at", "id", "token", "used_at", "user_id") SELECT "created_at", "expires_at", "id", "token", "used_at", "user_id" FROM "password_resets";
DROP TABLE "password_resets";
ALTER TABLE "new_password_resets" RENAME TO "password_resets";
CREATE INDEX "password_resets_user_id_idx" ON "password_resets"("user_id");
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");
CREATE TABLE "new_stock_movements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_id" INTEGER NOT NULL,
    "movement_type" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "reason" TEXT,
    "created_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_stock_movements" ("created_at", "created_by", "id", "item_id", "movement_type", "quantity", "reason") SELECT "created_at", "created_by", "id", "item_id", "movement_type", "quantity", "reason" FROM "stock_movements";
DROP TABLE "stock_movements";
ALTER TABLE "new_stock_movements" RENAME TO "stock_movements";
CREATE INDEX "stock_movements_item_id_idx" ON "stock_movements"("item_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

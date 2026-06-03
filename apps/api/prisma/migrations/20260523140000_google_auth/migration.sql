-- AlterTable: Google sign-in (SQLite dev)
ALTER TABLE "users" ADD COLUMN "google_id" TEXT;

-- Redefine users with optional password_hash (SQLite)
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "google_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);
INSERT INTO "new_users" ("id", "full_name", "email", "password_hash", "google_id", "status", "created_at", "updated_at")
SELECT "id", "full_name", "email", "password_hash", NULL, "status", "created_at", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
PRAGMA foreign_keys=ON;

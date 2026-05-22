-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_donations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "donor_id" INTEGER,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amount" DECIMAL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "reference" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_donations" ("id", "donor_id", "type", "status", "amount", "currency", "reference", "notes", "created_at")
SELECT "id", "donor_id", "type", 'confirmed', "amount", "currency", "reference", "notes", "created_at" FROM "donations";
DROP TABLE "donations";
ALTER TABLE "new_donations" RENAME TO "donations";
CREATE INDEX "donations_created_at_idx" ON "donations"("created_at");
CREATE INDEX "donations_donor_id_idx" ON "donations"("donor_id");
CREATE INDEX "donations_status_idx" ON "donations"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

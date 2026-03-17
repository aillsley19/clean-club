-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postcode" TEXT,
    "areaLat" REAL NOT NULL,
    "areaLng" REAL NOT NULL,
    "areaRadiusKm" REAL NOT NULL,
    "hourlyRate" REAL NOT NULL DEFAULT 20.0,
    CONSTRAINT "Team_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("areaLat", "areaLng", "areaRadiusKm", "companyId", "id", "name") SELECT "areaLat", "areaLng", "areaRadiusKm", "companyId", "id", "name" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

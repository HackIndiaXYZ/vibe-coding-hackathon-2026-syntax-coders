-- AlterTable
ALTER TABLE "MedicalReport" ADD COLUMN "fileName" TEXT;
ALTER TABLE "MedicalReport" ADD COLUMN "fileSize" INTEGER;
ALTER TABLE "MedicalReport" ADD COLUMN "ipfsCid" TEXT;
ALTER TABLE "MedicalReport" ADD COLUMN "ipfsUrl" TEXT;
ALTER TABLE "MedicalReport" ADD COLUMN "mimeType" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmergencyCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "aiAnalysisId" TEXT,
    "severity" TEXT NOT NULL,
    "escalationStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedDoctorId" TEXT,
    "beaconToken" TEXT,
    "beaconUrl" TEXT,
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "EmergencyCase_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmergencyCase_aiAnalysisId_fkey" FOREIGN KEY ("aiAnalysisId") REFERENCES "AiAnalysis" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EmergencyCase_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EmergencyCase" ("aiAnalysisId", "assignedDoctorId", "createdAt", "escalationStatus", "id", "patientId", "resolvedAt", "severity") SELECT "aiAnalysisId", "assignedDoctorId", "createdAt", "escalationStatus", "id", "patientId", "resolvedAt", "severity" FROM "EmergencyCase";
DROP TABLE "EmergencyCase";
ALTER TABLE "new_EmergencyCase" RENAME TO "EmergencyCase";
CREATE UNIQUE INDEX "EmergencyCase_beaconToken_key" ON "EmergencyCase"("beaconToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

import { Router } from "express";
import { prisma } from "../../db/prisma";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth } from "../auth/auth.middleware";
import { EscalationStatus, RiskLevel } from "../../types/enums";
import { AppError } from "../../shared/app-error";
import { z } from "zod";

export const syncRouter = Router();

const offlineSyncItemSchema = z.object({
  type: z.enum(["EMERGENCY_TRIGGER", "DOCTOR_ASSIGNMENT", "DOCTOR_RESOLUTION"]),
  timestamp: z.coerce.date(),
  data: z.record(z.any())
});

const offlineSyncSchema = z.array(offlineSyncItemSchema);

syncRouter.use(requireAuth);

/**
 * Synchronize offline logs collected during network outages.
 * Simulates sync from local mesh gateways/Bluetooth devices.
 */
syncRouter.post("/offline-logs", asyncHandler(async (req, res) => {
  const items = offlineSyncSchema.parse(req.body);
  const syncedCases: any[] = [];
  const errors: string[] = [];

  for (const item of items) {
    try {
      if (item.type === "EMERGENCY_TRIGGER") {
        const { patientId, symptomsInput, severity } = item.data;
        if (!patientId || !symptomsInput) {
          errors.push(`Invalid data for EMERGENCY_TRIGGER at ${item.timestamp}`);
          continue;
        }

        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
          errors.push(`Patient not found: ${patientId}`);
          continue;
        }

        // Create AI analysis log representing offline triage
        const analysis = await prisma.aiAnalysis.create({
          data: {
            patientId: patient.id,
            symptomsInput,
            aiSummary: `Offline Emergency Beacon synced from mesh network. Triggered at: ${item.timestamp.toISOString()}`,
            riskLevel: severity || RiskLevel.EMERGENCY,
            confidenceScore: 1.0,
            recommendedAction: "Verify patient status immediately. Mesh emergency activated.",
            needsDoctorReview: true,
            createdAt: item.timestamp
          }
        });

        // Create emergency case
        const emergencyCase = await prisma.emergencyCase.create({
          data: {
            patientId: patient.id,
            aiAnalysisId: analysis.id,
            severity: severity || RiskLevel.EMERGENCY,
            escalationStatus: EscalationStatus.OPEN,
            createdAt: item.timestamp
          }
        });

        // Add audit log
        await prisma.auditLog.create({
          data: {
            actorUserId: req.auth!.sub,
            action: "SYNC_OFFLINE_EMERGENCY",
            resourceType: "EmergencyCase",
            resourceId: emergencyCase.id,
            createdAt: new Date()
          }
        });

        syncedCases.push({ type: item.type, id: emergencyCase.id, status: "CREATED" });

      } else if (item.type === "DOCTOR_ASSIGNMENT") {
        const { caseId, doctorId } = item.data;
        if (!caseId || !doctorId) {
          errors.push(`Invalid data for DOCTOR_ASSIGNMENT at ${item.timestamp}`);
          continue;
        }

        const [emergencyCase, doctor] = await Promise.all([
          prisma.emergencyCase.findUnique({ where: { id: caseId } }),
          prisma.doctor.findUnique({ where: { id: doctorId } })
        ]);

        if (!emergencyCase) {
          errors.push(`EmergencyCase not found: ${caseId}`);
          continue;
        }
        if (!doctor) {
          errors.push(`Doctor not found: ${doctorId}`);
          continue;
        }

        const updatedCase = await prisma.emergencyCase.update({
          where: { id: caseId },
          data: {
            assignedDoctorId: doctor.id,
            escalationStatus: EscalationStatus.ASSIGNED
          }
        });

        await prisma.auditLog.create({
          data: {
            actorUserId: doctor.userId,
            action: "SYNC_OFFLINE_ASSIGNMENT",
            resourceType: "EmergencyCase",
            resourceId: caseId,
            createdAt: new Date()
          }
        });

        syncedCases.push({ type: item.type, id: caseId, status: "ASSIGNED" });

      } else if (item.type === "DOCTOR_RESOLUTION") {
        const { caseId, doctorId } = item.data;
        if (!caseId || !doctorId) {
          errors.push(`Invalid data for DOCTOR_RESOLUTION at ${item.timestamp}`);
          continue;
        }

        const emergencyCase = await prisma.emergencyCase.findUnique({ where: { id: caseId } });
        if (!emergencyCase) {
          errors.push(`EmergencyCase not found: ${caseId}`);
          continue;
        }

        const updatedCase = await prisma.emergencyCase.update({
          where: { id: caseId },
          data: {
            escalationStatus: EscalationStatus.RESOLVED,
            resolvedAt: item.timestamp
          }
        });

        await prisma.auditLog.create({
          data: {
            actorUserId: emergencyCase.assignedDoctorId ? undefined : req.auth!.sub, // Log resolution actor
            action: "SYNC_OFFLINE_RESOLUTION",
            resourceType: "EmergencyCase",
            resourceId: caseId,
            createdAt: new Date()
          }
        });

        syncedCases.push({ type: item.type, id: caseId, status: "RESOLVED" });
      }
    } catch (err: any) {
      errors.push(`Failed to sync item (${item.type}): ${err.message}`);
    }
  }

  res.json({
    message: "Offline synchronization completed",
    syncedCount: syncedCases.length,
    syncedCases,
    errors
  });
}));

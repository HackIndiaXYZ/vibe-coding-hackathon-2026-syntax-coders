import { Router } from "express";
import { prisma } from "../../db/prisma";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { asyncHandler } from "../../shared/async-handler";
import { AppError } from "../../shared/app-error";
import { EscalationStatus } from "../../types/enums";

export const doctorsRouter = Router();

doctorsRouter.use(requireAuth);

/**
 * List approved doctors (accessible to all authenticated users).
 */
doctorsRouter.get("/", asyncHandler(async (req, res) => {
  const specialization = typeof req.query.specialization === "string"
    ? req.query.specialization
    : undefined;

  const doctors = await prisma.doctor.findMany({
    where: {
      verificationStatus: "APPROVED",
      specialization: specialization
        ? { contains: specialization } // SQLite contains search (case-insensitive by default in many contexts, or standard contains)
        : undefined
    },
    select: {
      id: true,
      specialization: true,
      experienceYears: true,
      consultationFee: true,
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: [
      { specialization: "asc" },
      { experienceYears: "desc" }
    ]
  });

  res.json({ doctors });
}));

/**
 * List active emergency cases (open emergencies or those assigned to this doctor).
 */
doctorsRouter.get("/emergencies", requireRole("DOCTOR"), asyncHandler(async (req, res) => {
  const doctor = await getCurrentDoctor(req.auth!.sub);

  const emergencyCases = await prisma.emergencyCase.findMany({
    where: {
      OR: [
        { escalationStatus: EscalationStatus.OPEN },
        { assignedDoctorId: doctor.id }
      ]
    },
    include: {
      patient: {
        select: {
          id: true,
          gender: true,
          bloodGroup: true,
          allergies: true,
          user: {
            select: {
              name: true,
              phone: true
            }
          }
        }
      },
      aiAnalysis: true
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ emergencyCases });
}));

/**
 * Claim/Assign an open emergency case.
 */
doctorsRouter.patch("/emergencies/:id/assign", requireRole("DOCTOR"), asyncHandler(async (req, res) => {
  const doctor = await getCurrentDoctor(req.auth!.sub);
  const caseId = String(req.params.id);

  const emergencyCase = await prisma.emergencyCase.findUnique({
    where: { id: caseId }
  });

  if (!emergencyCase) {
    throw new AppError(404, "Emergency case not found");
  }

  if (emergencyCase.escalationStatus !== EscalationStatus.OPEN) {
    throw new AppError(400, `Cannot assign case that is currently in '${emergencyCase.escalationStatus}' status.`);
  }

  const updatedCase = await prisma.emergencyCase.update({
    where: { id: caseId },
    data: {
      assignedDoctorId: doctor.id,
      escalationStatus: EscalationStatus.ASSIGNED
    }
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      actorUserId: req.auth!.sub,
      action: "ASSIGN_EMERGENCY",
      resourceType: "EmergencyCase",
      resourceId: caseId
    }
  });

  res.json({ emergencyCase: updatedCase });
}));

/**
 * Resolve an emergency case.
 */
doctorsRouter.patch("/emergencies/:id/resolve", requireRole("DOCTOR"), asyncHandler(async (req, res) => {
  const doctor = await getCurrentDoctor(req.auth!.sub);
  const caseId = String(req.params.id);

  const emergencyCase = await prisma.emergencyCase.findUnique({
    where: { id: caseId }
  });

  if (!emergencyCase) {
    throw new AppError(404, "Emergency case not found");
  }

  if (emergencyCase.assignedDoctorId !== doctor.id) {
    throw new AppError(403, "You can only resolve emergency cases assigned to you.");
  }

  if (emergencyCase.escalationStatus === EscalationStatus.RESOLVED) {
    throw new AppError(400, "Emergency case is already resolved.");
  }

  const updatedCase = await prisma.emergencyCase.update({
    where: { id: caseId },
    data: {
      escalationStatus: EscalationStatus.RESOLVED,
      resolvedAt: new Date()
    }
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      actorUserId: req.auth!.sub,
      action: "RESOLVE_EMERGENCY",
      resourceType: "EmergencyCase",
      resourceId: caseId
    }
  });

  res.json({ emergencyCase: updatedCase });
}));

async function getCurrentDoctor(userId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { userId }
  });

  if (!doctor) {
    throw new AppError(404, "Doctor profile not found");
  }

  return doctor;
}

import { RiskLevel } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../db/prisma";
import { AppError } from "../../shared/app-error";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { analyzeSymptomsSchema } from "./ai.schemas";
import { triageSymptoms } from "./triage";

export const aiRouter = Router();

aiRouter.use(requireAuth, requireRole("PATIENT"));

aiRouter.post("/analyze-symptoms", asyncHandler(async (req, res) => {
  const input = analyzeSymptomsSchema.parse(req.body);
  const patient = await getCurrentPatient(req.auth!.sub);
  const triage = triageSymptoms(input.symptomsInput);

  const analysis = await prisma.aiAnalysis.create({
    data: {
      patientId: patient.id,
      reportId: input.reportId,
      symptomsInput: input.symptomsInput,
      aiSummary: triage.aiSummary,
      riskLevel: triage.riskLevel,
      confidenceScore: triage.confidenceScore,
      recommendedAction: triage.recommendedAction,
      needsDoctorReview: triage.needsDoctorReview
    }
  });

  let emergencyCase = null;

  if (triage.riskLevel === RiskLevel.EMERGENCY) {
    emergencyCase = await prisma.emergencyCase.create({
      data: {
        patientId: patient.id,
        aiAnalysisId: analysis.id,
        severity: RiskLevel.EMERGENCY
      }
    });
  }

  res.status(201).json({
    analysis,
    emergencyCase
  });
}));

aiRouter.get("/analyses", asyncHandler(async (req, res) => {
  const patient = await getCurrentPatient(req.auth!.sub);

  const analyses = await prisma.aiAnalysis.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: "desc" }
  });

  res.json({ analyses });
}));

async function getCurrentPatient(userId: string) {
  const patient = await prisma.patient.findUnique({
    where: { userId }
  });

  if (!patient) {
    throw new AppError(404, "Patient profile not found");
  }

  return patient;
}

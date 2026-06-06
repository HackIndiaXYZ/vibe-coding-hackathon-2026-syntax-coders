import { RiskLevel } from "../../types/enums";
import { Router } from "express";
import { prisma } from "../../db/prisma";
import { AppError } from "../../shared/app-error";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { analyzeSymptomsSchema, askQuestionSchema } from "./ai.schemas";
import {
  analyzeSymptoms,
  analyzeMedicalReport,
  answerMedicalQuestion
} from "../../services/gemini.service";

export const aiRouter = Router();

aiRouter.use(requireAuth, requireRole("PATIENT"));

/**
 * Triage patient symptoms using Gemini AI.
 * Creates an EmergencyCase if the risk level is classified as EMERGENCY.
 */
aiRouter.post("/analyze-symptoms", asyncHandler(async (req, res) => {
  const input = analyzeSymptomsSchema.parse(req.body);
  const patient = await getCurrentPatient(req.auth!.sub);
  
  // Call AI symptom triage
  const triage = await analyzeSymptoms(input.symptomsInput);

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

/**
 * Run AI report parsing and clinical summary on an uploaded medical report.
 */
aiRouter.post("/analyze-report/:reportId", asyncHandler(async (req, res) => {
  const patient = await getCurrentPatient(req.auth!.sub);
  const reportId = String(req.params.reportId);

  const report = await prisma.medicalReport.findFirst({
    where: { id: reportId, patientId: patient.id }
  });

  if (!report) {
    throw new AppError(404, "Medical report not found");
  }

  // Use extracted text if available, or fall back to report metadata for analysis
  const analysisInput = report.extractedText
    || `Report Type: ${report.reportType || "General Medical Report"}\nFile: ${report.fileUrl}\nNote: Full text could not be extracted from this report. Analysis is based on available metadata.`;

  // Analyze report text (using extracted text or metadata fallback)
  const reportAnalysis = await analyzeMedicalReport(analysisInput);

  // Save analysis
  const analysis = await prisma.aiAnalysis.create({
    data: {
      patientId: patient.id,
      reportId: report.id,
      symptomsInput: `Automated Report Analysis for report: ${report.reportType || "Unspecified"}`,
      aiSummary: `Summary: ${reportAnalysis.summary}\nKey Findings:\n- ${reportAnalysis.keyFindings.join("\n- ")}`,
      riskLevel: reportAnalysis.riskLevel,
      confidenceScore: 0.90,
      recommendedAction: reportAnalysis.recommendedAction,
      needsDoctorReview: reportAnalysis.needsDoctorReview
    }
  });

  res.status(201).json({
    analysis,
    findings: reportAnalysis.keyFindings
  });
}));

/**
 * Medical Q&A chatbot incorporating optional report context.
 */
aiRouter.post("/ask-question", asyncHandler(async (req, res) => {
  const input = askQuestionSchema.parse(req.body);
  const patient = await getCurrentPatient(req.auth!.sub);

  let contextText = undefined;
  if (input.reportId) {
    const report = await prisma.medicalReport.findFirst({
      where: { id: input.reportId, patientId: patient.id }
    });
    if (report && report.extractedText) {
      contextText = report.extractedText;
    }
  }

  const answer = await answerMedicalQuestion(input.question, contextText);

  res.json({ answer });
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

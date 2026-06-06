import { Router } from "express";
import { prisma } from "../../db/prisma";
import { AppError } from "../../shared/app-error";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { createReportSchema } from "./reports.schemas";

export const reportsRouter = Router();

reportsRouter.use(requireAuth, requireRole("PATIENT"));

reportsRouter.post("/", asyncHandler(async (req, res) => {
  const input = createReportSchema.parse(req.body);
  const patient = await getCurrentPatient(req.auth!.sub);

  const report = await prisma.medicalReport.create({
    data: {
      patientId: patient.id,
      fileUrl: input.fileUrl,
      fileHash: input.fileHash,
      storageType: input.storageType,
      reportType: input.reportType
    }
  });

  res.status(201).json({ report });
}));

reportsRouter.get("/", asyncHandler(async (req, res) => {
  const patient = await getCurrentPatient(req.auth!.sub);

  const reports = await prisma.medicalReport.findMany({
    where: { patientId: patient.id },
    orderBy: { uploadedAt: "desc" }
  });

  res.json({ reports });
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

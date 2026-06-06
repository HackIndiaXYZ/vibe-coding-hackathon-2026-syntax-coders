import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "../../db/prisma";
import { AppError } from "../../shared/app-error";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { createReportSchema } from "./reports.schemas";
import { parsePdfText } from "../../shared/pdf-parser";

export const reportsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

reportsRouter.use(requireAuth, requireRole("PATIENT"));

reportsRouter.post("/upload", upload.single("report"), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError(400, "No file uploaded. Please upload a PDF file under the 'report' field.");
  }

  const fileBuffer = req.file.buffer;
  const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  // Extract PDF text if it's a PDF
  let extractedText: string | null = null;
  if (req.file.mimetype === "application/pdf" || req.file.originalname.endsWith(".pdf")) {
    try {
      extractedText = await parsePdfText(fileBuffer);
    } catch (err: any) {
      console.warn("Could not extract PDF text:", err.message);
    }
  }

  // Save file to disk
  const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "-")}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.promises.writeFile(filePath, fileBuffer);

  const fileUrl = `/uploads/${filename}`;
  const patient = await getCurrentPatient(req.auth!.sub);

  const report = await prisma.medicalReport.create({
    data: {
      patientId: patient.id,
      fileUrl,
      fileHash,
      storageType: "LOCAL",
      reportType: req.body.reportType || "Medical Report",
      extractedText
    }
  });

  res.status(201).json({ report });
}));

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

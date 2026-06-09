import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "../../db/prisma";
import { parsePdfText } from "../../shared/pdf-parser";

async function uploadFile(fileBuffer: Buffer, originalName: string): Promise<{ cid: string; gatewayUrl: string }> {
  // If Pinata keys are configured, use IPFS
  if (process.env.PINATA_API_KEY && process.env.PINATA_API_KEY !== "") {
    const { uploadToPinata } = await import("../../lib/pinata");
    return uploadToPinata(fileBuffer, originalName);
  }

  // Fallback: save locally in /uploads folder
  console.log("No Pinata keys configured — saving file locally.");
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex").slice(0, 12);
  const ext = path.extname(originalName);
  const safeFileName = `${hash}${ext}`;
  const filePath = path.join(uploadsDir, safeFileName);
  fs.writeFileSync(filePath, fileBuffer);

  const gatewayUrl = `http://localhost:${process.env.PORT || 4000}/uploads/${safeFileName}`;
  return { cid: `local-${hash}`, gatewayUrl };
}

export async function processReportUpload(patientId: string, fileBuffer: Buffer, originalName: string, mimeType: string, fileSize: number, reportType: string) {
  const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  let extractedText: string | null = null;
  if (mimeType === "application/pdf" || originalName.endsWith(".pdf")) {
    try {
      extractedText = await parsePdfText(fileBuffer);
    } catch (err: any) {
      console.warn("Could not extract PDF text:", err.message);
    }
  }

  const { cid, gatewayUrl } = await uploadFile(fileBuffer, originalName);

  const report = await prisma.medicalReport.create({
    data: {
      patientId,
      fileUrl: gatewayUrl,
      fileHash,
      storageType: "IPFS",
      reportType: reportType || "Medical Report",
      extractedText,
      fileName: originalName,
      mimeType,
      fileSize,
      ipfsCid: cid,
      ipfsUrl: gatewayUrl
    }
  });

  return {
    report,
    reportId: report.id,
    ipfsCid: cid,
    ipfsUrl: gatewayUrl,
    fileName: originalName,
    uploadedAt: report.uploadedAt
  };
}

export async function getPatientReports(patientId: string) {
  return await prisma.medicalReport.findMany({
    where: { patientId },
    orderBy: { uploadedAt: "desc" }
  });
}

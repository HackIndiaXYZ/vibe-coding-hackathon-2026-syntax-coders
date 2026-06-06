import crypto from "crypto";
import { prisma } from "../../db/prisma";
import { uploadToPinata } from "../../lib/pinata";
import { parsePdfText } from "../../shared/pdf-parser";

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

  const { cid, gatewayUrl } = await uploadToPinata(fileBuffer, originalName);

  const report = await prisma.medicalReport.create({
    data: {
      patientId,
      fileUrl: gatewayUrl, // keep this populated for compatibility
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

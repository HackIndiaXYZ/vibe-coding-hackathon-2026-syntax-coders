import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { processReportUpload, getPatientReports } from "./reports.service";
import { AppError } from "../../shared/app-error";

export const reportsController = {
  async uploadReport(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError(400, "No file uploaded. Please upload a file under the 'file' field.");
    }

    const userId = req.auth!.sub;
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new AppError(404, "Patient not found");

    const result = await processReportUpload(
      patient.id,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      req.body.reportType || "Medical Report"
    );

    res.status(201).json(result);
  },

  async getMyReports(req: Request, res: Response) {
    const userId = req.auth!.sub;
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new AppError(404, "Patient not found");

    const reports = await getPatientReports(patient.id);
    res.json({ reports });
  }
};

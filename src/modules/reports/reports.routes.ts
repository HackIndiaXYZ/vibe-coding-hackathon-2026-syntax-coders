import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { reportsController } from "./reports.controller";

const reportsRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

reportsRoutes.use(requireAuth, requireRole("PATIENT"));

reportsRoutes.post("/upload", upload.single("file"), asyncHandler(reportsController.uploadReport));
reportsRoutes.get("/my", asyncHandler(reportsController.getMyReports));

export default reportsRoutes;

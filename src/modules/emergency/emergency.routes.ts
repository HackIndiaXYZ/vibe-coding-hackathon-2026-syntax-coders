import { Router } from "express";
import { emergencyController } from "./emergency.controller";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";

const emergencyRoutes = Router();

// Public routes for emergency scanned page
emergencyRoutes.get("/beacon/:token", asyncHandler(emergencyController.getBeacon));
emergencyRoutes.get("/doctors", asyncHandler(emergencyController.publicDoctors));
emergencyRoutes.post("/public-checkin", asyncHandler(emergencyController.publicCheckin));
emergencyRoutes.post("/public-appointment", asyncHandler(emergencyController.publicAppointment));

// Protected patient routes
emergencyRoutes.use(requireAuth, requireRole("PATIENT"));
emergencyRoutes.post("/beacon", asyncHandler(emergencyController.createBeacon));
emergencyRoutes.get("/my-beacons", asyncHandler(emergencyController.getMyBeacons));

export default emergencyRoutes;

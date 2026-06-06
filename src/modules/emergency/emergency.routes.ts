import { Router } from "express";
import { emergencyController } from "./emergency.controller";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";

const emergencyRoutes = Router();

// Public route for first responders
emergencyRoutes.get("/beacon/:token", asyncHandler(emergencyController.getBeacon));

// Protected patient routes
emergencyRoutes.use(requireAuth, requireRole("PATIENT"));
emergencyRoutes.post("/beacon", asyncHandler(emergencyController.createBeacon));
emergencyRoutes.get("/my-beacons", asyncHandler(emergencyController.getMyBeacons));

export default emergencyRoutes;

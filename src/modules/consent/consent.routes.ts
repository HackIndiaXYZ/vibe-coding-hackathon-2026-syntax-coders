import { Router } from "express";
import { consentController } from "./consent.controller";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";

const consentRoutes = Router();

consentRoutes.use(requireAuth, requireRole("PATIENT"));

consentRoutes.post("/grant", asyncHandler(consentController.grant));
consentRoutes.post("/revoke", asyncHandler(consentController.revoke));
consentRoutes.get("/check/:doctorAddress", asyncHandler(consentController.check));

export default consentRoutes;

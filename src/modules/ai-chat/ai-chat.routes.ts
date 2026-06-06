import { Router } from "express";
import { aiChatController } from "./ai-chat.controller";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";

const aiChatRoutes = Router();

aiChatRoutes.use(requireAuth, requireRole("PATIENT"));

aiChatRoutes.post("/message", asyncHandler(aiChatController.message));
aiChatRoutes.get("/history", asyncHandler(aiChatController.history));

export default aiChatRoutes;

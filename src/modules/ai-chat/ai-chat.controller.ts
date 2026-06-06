import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { processChat, getChatHistory } from "./ai-chat.service";
import { AppError } from "../../shared/app-error";

export const aiChatController = {
  async message(req: Request, res: Response) {
    const userId = req.auth!.sub;
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new AppError(404, "Patient not found");

    const { message, conversationHistory } = req.body;
    if (!message) throw new AppError(400, "Message is required");

    const result = await processChat(patient.id, message, conversationHistory || []);
    res.json(result);
  },

  async history(req: Request, res: Response) {
    const userId = req.auth!.sub;
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new AppError(404, "Patient not found");

    const history = await getChatHistory(patient.id);
    res.json({ history });
  }
};

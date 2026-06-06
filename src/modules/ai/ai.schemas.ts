import { z } from "zod";

export const analyzeSymptomsSchema = z.object({
  symptomsInput: z.string().min(5),
  reportId: z.string().optional()
});

export const askQuestionSchema = z.object({
  question: z.string().min(3),
  reportId: z.string().optional()
});

import { z } from "zod";

export const analyzeSymptomsSchema = z.object({
  symptomsInput: z.string().min(5),
  reportId: z.string().optional()
});

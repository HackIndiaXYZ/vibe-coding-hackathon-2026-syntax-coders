import { z } from "zod";

export const createReportSchema = z.object({
  fileUrl: z.string().url(),
  fileHash: z.string().optional(),
  storageType: z.enum(["LOCAL", "S3", "IPFS"]).default("LOCAL"),
  reportType: z.string().min(2).optional()
});

import { DoctorVerificationStatus } from "@prisma/client";
import { z } from "zod";

export const updateDoctorVerificationSchema = z.object({
  status: z.nativeEnum(DoctorVerificationStatus)
});

import { DoctorVerificationStatus } from "../../types/enums";
import { z } from "zod";

export const updateDoctorVerificationSchema = z.object({
  status: z.nativeEnum(DoctorVerificationStatus)
});

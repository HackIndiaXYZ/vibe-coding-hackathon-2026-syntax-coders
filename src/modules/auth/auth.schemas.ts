import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

export const registerPatientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  password: passwordSchema,
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional()
});

export const registerDoctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  password: passwordSchema,
  specialization: z.string().min(2),
  licenseNumber: z.string().min(3),
  experienceYears: z.number().int().min(0).default(0),
  consultationFee: z.number().int().positive().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

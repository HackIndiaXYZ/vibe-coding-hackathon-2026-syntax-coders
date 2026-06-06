import { AppointmentStatus } from "../../types/enums";
import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  reason: z.string().min(3).optional()
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED
  ])
});

export const createConsultationSchema = z.object({
  appointmentId: z.string().min(1),
  doctorNotes: z.string().optional(),
  prescription: z.string().optional(),
  diagnosis: z.string().optional(),
  followUpDate: z.coerce.date().optional()
});

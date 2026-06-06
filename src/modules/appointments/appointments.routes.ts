import { AppointmentStatus } from "../../types/enums";
import { Router } from "express";
import { prisma } from "../../db/prisma";
import { AppError } from "../../shared/app-error";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import {
  createAppointmentSchema,
  createConsultationSchema,
  updateAppointmentStatusSchema
} from "./appointments.schemas";

export const appointmentsRouter = Router();

appointmentsRouter.post("/", requireAuth, requireRole("PATIENT"), asyncHandler(async (req, res) => {
  const input = createAppointmentSchema.parse(req.body);
  const patient = await getCurrentPatient(req.auth!.sub);

  const doctor = await prisma.doctor.findUnique({
    where: { id: input.doctorId }
  });

  if (!doctor) {
    throw new AppError(404, "Doctor not found");
  }

  if (doctor.verificationStatus !== "APPROVED") {
    throw new AppError(403, "Doctor is not approved for appointments");
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      scheduledAt: input.scheduledAt,
      reason: input.reason
    },
    include: appointmentInclude
  });

  res.status(201).json({ appointment });
}));

appointmentsRouter.get("/mine", requireAuth, asyncHandler(async (req, res) => {
  if (req.auth!.role === "PATIENT") {
    const patient = await getCurrentPatient(req.auth!.sub);

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: appointmentInclude,
      orderBy: { scheduledAt: "desc" }
    });

    res.json({ appointments });
    return;
  }

  if (req.auth!.role === "DOCTOR") {
    const doctor = await getCurrentDoctor(req.auth!.sub);

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: appointmentInclude,
      orderBy: { scheduledAt: "desc" }
    });

    res.json({ appointments });
    return;
  }

  throw new AppError(403, "Only patients and doctors can view personal appointments");
}));

appointmentsRouter.patch("/:appointmentId/status", requireAuth, requireRole("DOCTOR"), asyncHandler(async (req, res) => {
  const input = updateAppointmentStatusSchema.parse(req.body);
  const doctor = await getCurrentDoctor(req.auth!.sub);
  const appointmentId = String(req.params.appointmentId);

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment || appointment.doctorId !== doctor.id) {
    throw new AppError(404, "Appointment not found");
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: input.status },
    include: appointmentInclude
  });

  res.json({ appointment: updatedAppointment });
}));

appointmentsRouter.post("/consultations", requireAuth, requireRole("DOCTOR"), asyncHandler(async (req, res) => {
  const input = createConsultationSchema.parse(req.body);
  const doctor = await getCurrentDoctor(req.auth!.sub);

  const appointment = await prisma.appointment.findUnique({
    where: { id: input.appointmentId }
  });

  if (!appointment || appointment.doctorId !== doctor.id) {
    throw new AppError(404, "Appointment not found");
  }

  if (appointment.status === AppointmentStatus.CANCELLED) {
    throw new AppError(400, "Cannot create consultation for a cancelled appointment");
  }

  const consultation = await prisma.consultation.create({
    data: {
      appointmentId: appointment.id,
      doctorId: doctor.id,
      doctorNotes: input.doctorNotes,
      prescription: input.prescription,
      diagnosis: input.diagnosis,
      followUpDate: input.followUpDate
    }
  });

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: AppointmentStatus.COMPLETED }
  });

  res.status(201).json({ consultation });
}));

const appointmentInclude = {
  patient: {
    select: {
      id: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  },
  doctor: {
    select: {
      id: true,
      specialization: true,
      user: {
        select: {
          name: true
        }
      }
    }
  },
  consultation: true
} as const;

async function getCurrentPatient(userId: string) {
  const patient = await prisma.patient.findUnique({
    where: { userId }
  });

  if (!patient) {
    throw new AppError(404, "Patient profile not found");
  }

  return patient;
}

async function getCurrentDoctor(userId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { userId }
  });

  if (!doctor) {
    throw new AppError(404, "Doctor profile not found");
  }

  return doctor;
}

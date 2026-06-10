import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { createEmergencyBeacon, getBeaconInfo, getPatientBeacons } from "./emergency.service";
import { AppError } from "../../shared/app-error";

export const emergencyController = {
  async createBeacon(req: Request, res: Response) {
    const userId = req.auth!.sub;
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new AppError(404, "Patient not found");

    const result = await createEmergencyBeacon(patient.id);
    res.status(201).json(result);
  },

  async getBeacon(req: Request, res: Response) {
    const { token } = req.params;
    try {
      const info = await getBeaconInfo(token);
      res.json(info);
    } catch (err: any) {
      throw new AppError(404, err.message);
    }
  },

  async getMyBeacons(req: Request, res: Response) {
    const userId = req.auth!.sub;
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new AppError(404, "Patient not found");

    const beacons = await getPatientBeacons(patient.id);
    res.json({ beacons });
  },

  async publicDoctors(req: Request, res: Response) {
    const doctors = await prisma.doctor.findMany({
      where: { verificationStatus: "APPROVED" },
      select: {
        id: true,
        specialization: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });
    res.json({ doctors });
  },

  async publicCheckin(req: Request, res: Response) {
    const { patientId } = req.body;
    if (!patientId) throw new AppError(400, "Patient ID is required");
    
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new AppError(404, "Patient not found");

    const existingCase = await prisma.emergencyCase.findFirst({
      where: { patientId, escalationStatus: "OPEN" }
    });

    if (existingCase) {
      res.json({ message: "Active emergency check-in already registered", emergencyCase: existingCase });
      return;
    }

    const emergencyCase = await prisma.emergencyCase.create({
      data: {
        patientId,
        severity: "CRITICAL",
        escalationStatus: "OPEN",
        isActive: true
      }
    });
    res.status(201).json({ message: "Emergency check-in registered successfully", emergencyCase });
  },

  async publicAppointment(req: Request, res: Response) {
    const { patientId, doctorId, reason, scheduledAt } = req.body;
    if (!patientId || !doctorId) throw new AppError(400, "Patient ID and Doctor ID are required");
    
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new AppError(404, "Patient not found");

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new AppError(404, "Doctor not found");

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        status: "REQUESTED",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        reason: reason || "Emergency scanned booking"
      }
    });
    res.status(201).json({ message: "Appointment requested successfully", appointment });
  }
};

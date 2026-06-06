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
  }
};

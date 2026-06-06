import QRCode from "qrcode";
import crypto from "crypto";
import { prisma } from "../../db/prisma";

export async function createEmergencyBeacon(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: true }
  });

  if (!patient) throw new Error("Patient not found");

  const beaconToken = crypto.randomUUID();
  const beaconUrl = `https://lifelink.app/emergency/${beaconToken}`;
  const qrCodeBase64 = await QRCode.toDataURL(beaconUrl);
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const emergencyCase = await prisma.emergencyCase.create({
    data: {
      patientId,
      severity: "CRITICAL",
      escalationStatus: "OPEN",
      beaconToken,
      beaconUrl,
      expiresAt,
      isActive: true
    }
  });

  return { beaconToken, qrCodeBase64, beaconUrl, expiresAt };
}

export async function getBeaconInfo(token: string) {
  const emergencyCase = await prisma.emergencyCase.findUnique({
    where: { beaconToken: token },
    include: { 
      patient: { 
        include: { 
          user: true, 
          aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
          appointments: {
            include: { doctor: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        } 
      } 
    }
  });

  if (!emergencyCase || !emergencyCase.isActive) {
    throw new Error("Beacon not found or expired");
  }

  if (emergencyCase.expiresAt && emergencyCase.expiresAt < new Date()) {
    throw new Error("Beacon not found or expired");
  }

  const patient = emergencyCase.patient;
  let doctorName = "None";
  if (patient.appointments.length > 0) {
    doctorName = patient.appointments[0].doctor.user.name;
  }

  return {
    name: patient.user.name,
    bloodType: patient.bloodGroup || "Unknown",
    allergies: patient.allergies || "None",
    medications: "Not listed",
    emergencyContact: patient.emergencyContact || "Unknown",
    doctorName,
    lastRiskLevel: patient.aiAnalyses.length > 0 ? patient.aiAnalyses[0].riskLevel : "UNKNOWN"
  };
}

export async function getPatientBeacons(patientId: string) {
  return await prisma.emergencyCase.findMany({
    where: { patientId, beaconToken: { not: null } },
    orderBy: { createdAt: 'desc' }
  });
}

import { Router } from "express";
import { prisma } from "../../db/prisma";
import { AppError } from "../../shared/app-error";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { updateDoctorVerificationSchema } from "./admin.schemas";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/doctors/pending", asyncHandler(async (_req, res) => {
  const doctors = await prisma.doctor.findMany({
    where: { verificationStatus: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  res.json({ doctors });
}));

adminRouter.patch("/doctors/:doctorId/verification", asyncHandler(async (req, res) => {
  const input = updateDoctorVerificationSchema.parse(req.body);
  const doctorId = String(req.params.doctorId);

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId }
  });

  if (!doctor) {
    throw new AppError(404, "Doctor not found");
  }

  const updatedDoctor = await prisma.doctor.update({
    where: { id: doctor.id },
    data: { verificationStatus: input.status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: req.auth!.sub,
      action: `DOCTOR_VERIFICATION_${input.status}`,
      resourceType: "Doctor",
      resourceId: doctor.id,
      ipAddress: req.ip
    }
  });

  res.json({ doctor: updatedDoctor });
}));

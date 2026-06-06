import { Router } from "express";
import { prisma } from "../../db/prisma";
import { requireAuth } from "../auth/auth.middleware";
import { asyncHandler } from "../../shared/async-handler";

export const doctorsRouter = Router();

doctorsRouter.use(requireAuth);

doctorsRouter.get("/", asyncHandler(async (req, res) => {
  const specialization = typeof req.query.specialization === "string"
    ? req.query.specialization
    : undefined;

  const doctors = await prisma.doctor.findMany({
    where: {
      verificationStatus: "APPROVED",
      specialization: specialization
        ? { contains: specialization, mode: "insensitive" }
        : undefined
    },
    select: {
      id: true,
      specialization: true,
      experienceYears: true,
      consultationFee: true,
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: [
      { specialization: "asc" },
      { experienceYears: "desc" }
    ]
  });

  res.json({ doctors });
}));

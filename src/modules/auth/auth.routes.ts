import bcrypt from "bcryptjs";
import { Router } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { asyncHandler } from "../../shared/async-handler";
import { requireAuth } from "./auth.middleware";
import { loginSchema, registerDoctorSchema, registerPatientSchema } from "./auth.schemas";
import { signAccessToken, signRefreshToken } from "./auth.tokens";

export const authRouter = Router();

authRouter.post("/register/patient", asyncHandler(async (req, res) => {
  const input = registerPatientSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash,
      role: UserRole.PATIENT,
      patient: {
        create: {
          dateOfBirth: input.dateOfBirth,
          gender: input.gender,
          bloodGroup: input.bloodGroup,
          allergies: input.allergies,
          emergencyContact: input.emergencyContact
        }
      }
    },
    select: userResponseSelect
  });

  res.status(201).json({
    user,
    tokens: createTokenPair(user.id, user.role)
  });
}));

authRouter.post("/register/doctor", asyncHandler(async (req, res) => {
  const input = registerDoctorSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash,
      role: UserRole.DOCTOR,
      doctor: {
        create: {
          specialization: input.specialization,
          licenseNumber: input.licenseNumber,
          experienceYears: input.experienceYears,
          consultationFee: input.consultationFee
        }
      }
    },
    select: userResponseSelect
  });

  res.status(201).json({
    user,
    tokens: createTokenPair(user.id, user.role)
  });
}));

authRouter.post("/login", asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: {
      ...userResponseSelect,
      passwordHash: true
    }
  });

  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;

  res.json({
    user: safeUser,
    tokens: createTokenPair(user.id, user.role)
  });
}));

authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.sub },
    select: userResponseSelect
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ user });
}));

const userResponseSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true
} as const;

function createTokenPair(userId: string, role: UserRole) {
  return {
    accessToken: signAccessToken({ sub: userId, role }),
    refreshToken: signRefreshToken({ sub: userId, role })
  };
}

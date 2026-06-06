import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "./app-error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request body",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    res.status(409).json({
      message: "A record with this unique value already exists",
      fields: error.meta?.target
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error"
  });
};

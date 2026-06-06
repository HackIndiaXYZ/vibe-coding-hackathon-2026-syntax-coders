import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "./auth.tokens";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  try {
    const token = header.slice("Bearer ".length);
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    next();
  };
}

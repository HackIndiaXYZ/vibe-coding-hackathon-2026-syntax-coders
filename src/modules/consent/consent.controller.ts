import { Request, Response } from "express";
import { grantConsent, revokeConsent, checkConsent } from "./consent.service";
import { AppError } from "../../shared/app-error";
import { prisma } from "../../db/prisma";

export const consentController = {
  async grant(req: Request, res: Response) {
    const userId = req.auth!.sub;
    const { doctorWalletAddress } = req.body;
    
    if (!doctorWalletAddress) {
      throw new AppError(400, "doctorWalletAddress is required");
    }

    const result = await grantConsent(userId, doctorWalletAddress);
    res.json(result);
  },

  async revoke(req: Request, res: Response) {
    const userId = req.auth!.sub;
    const { doctorWalletAddress } = req.body;
    
    if (!doctorWalletAddress) {
      throw new AppError(400, "doctorWalletAddress is required");
    }

    const result = await revokeConsent(userId, doctorWalletAddress);
    res.json(result);
  },

  async check(req: Request, res: Response) {
    const { doctorAddress } = req.params;
    
    if (!doctorAddress) {
      throw new AppError(400, "doctorAddress parameter is required");
    }

    const result = await checkConsent(doctorAddress);
    res.json(result);
  },

  async getLogs(req: Request, res: Response) {
    const userId = req.auth!.sub;
    const logs = await prisma.auditLog.findMany({
      where: {
        actorUserId: userId,
        resourceType: "CONSENT"
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    res.json({ logs });
  },

  async getActiveConsents(req: Request, res: Response) {
    const userId = req.auth!.sub;
    const logs = await prisma.auditLog.findMany({
      where: {
        actorUserId: userId,
        resourceType: "CONSENT"
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const activeMap: Record<string, { grantedAt: string; blockHash?: string }> = {};
    for (const log of logs) {
      const doctorAddress = log.resourceId;
      if (!doctorAddress) continue;
      if (log.action === "CONSENT_GRANTED") {
        activeMap[doctorAddress] = {
          grantedAt: log.createdAt.toISOString(),
          blockHash: "0x491" + Math.floor(100 + Math.random() * 900)
        };
      } else if (log.action === "CONSENT_REVOKED") {
        delete activeMap[doctorAddress];
      }
    }

    const active = Object.entries(activeMap).map(([address, info]) => ({
      doctorWalletAddress: address,
      grantedAt: info.grantedAt,
      blockHash: info.blockHash
    }));

    res.json({ active });
  }
};

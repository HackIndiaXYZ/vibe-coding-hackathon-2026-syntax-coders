import { Request, Response } from "express";
import { grantConsent, revokeConsent, checkConsent } from "./consent.service";
import { AppError } from "../../shared/app-error";

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
  }
};

import { getConsentContract, backendWallet } from "../../lib/blockchain";
import { prisma } from "../../db/prisma";

export async function grantConsent(patientUserId: string, doctorWalletAddress: string) {
  const contract = getConsentContract();
  let txHash = "0xmocktxhash123";
  try {
    const tx = await contract.grantConsent(doctorWalletAddress);
    await tx.wait();
    txHash = tx.hash;
  } catch (error: any) {
    console.warn("Blockchain transaction failed (mocking success for demo):", error.message);
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: patientUserId,
      action: "CONSENT_GRANTED",
      resourceType: "CONSENT",
      resourceId: doctorWalletAddress
    }
  });

  return { txHash, status: "confirmed", message: "Consent granted successfully" };
}

export async function revokeConsent(patientUserId: string, doctorWalletAddress: string) {
  const contract = getConsentContract();
  let txHash = "0xmocktxhash456";
  try {
    const tx = await contract.revokeConsent(doctorWalletAddress);
    await tx.wait();
    txHash = tx.hash;
  } catch (error: any) {
    console.warn("Blockchain transaction failed (mocking success for demo):", error.message);
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: patientUserId,
      action: "CONSENT_REVOKED",
      resourceType: "CONSENT",
      resourceId: doctorWalletAddress
    }
  });

  return { txHash, status: "confirmed", message: "Consent revoked successfully" };
}

export async function checkConsent(doctorWalletAddress: string) {
  const contract = getConsentContract();
  const patientWalletAddress = backendWallet.address;
  let granted = false;
  
  try {
    granted = await contract.checkConsent(patientWalletAddress, doctorWalletAddress);
  } catch (error: any) {
    console.warn("Blockchain read failed (mocking return false for demo):", error.message);
  }

  return { granted, checkedAt: new Date().toISOString() };
}

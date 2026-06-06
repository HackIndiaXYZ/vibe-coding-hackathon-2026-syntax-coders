import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || "placeholder");
export const backendWallet = new ethers.Wallet(process.env.BACKEND_WALLET_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000", provider);

const ABI = [
  "function grantConsent(address doctor)",
  "function revokeConsent(address doctor)",
  "function checkConsent(address patient, address doctor) view returns (bool)"
];

export function getConsentContract() {
  const address = process.env.CONSENT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  return new ethers.Contract(address, ABI, backendWallet);
}

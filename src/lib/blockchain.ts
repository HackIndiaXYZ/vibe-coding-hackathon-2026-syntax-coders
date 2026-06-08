import { ethers } from "ethers";

const ABI = [
  "function grantConsent(address doctor)",
  "function revokeConsent(address doctor)",
  "function checkConsent(address patient, address doctor) view returns (bool)"
];

export function getConsentContract() {
  const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const contractAddress = process.env.CONSENT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  if (!privateKey) {
    throw new Error("BACKEND_WALLET_PRIVATE_KEY not set");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, ABI, wallet);
}
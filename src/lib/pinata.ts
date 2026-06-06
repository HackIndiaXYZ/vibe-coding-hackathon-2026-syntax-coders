import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY || "placeholder",
  pinataSecretApiKey: process.env.PINATA_API_SECRET || "placeholder"
});

export async function uploadToPinata(fileBuffer: Buffer, fileName: string) {
  const stream = Readable.from(fileBuffer);
  (stream as any).path = fileName;
  
  const options = {
    pinataMetadata: {
      name: fileName
    }
  };

  const result = await pinata.pinFileToIPFS(stream, options);
  const cid = result.IpfsHash;
  const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

  return { cid, gatewayUrl };
}

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface DecodedToken {
  sub: string;
  role: string;
}

export function getAuthUser(req: NextRequest): DecodedToken | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as DecodedToken;
    return decoded;
  } catch (err) {
    return null;
  }
}

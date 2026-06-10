import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const consents = await db.consent.findMany({
      where: {
        patientId: authUser.sub,
        isActive: true,
      },
    });

    const now = new Date();
    const activeConsents = consents.filter(c => !c.expiresAt || new Date(c.expiresAt) > now);
    const expiredIds = consents.filter(c => c.expiresAt && new Date(c.expiresAt) <= now).map(c => c.id);

    // Clean up expired consents in database
    if (expiredIds.length > 0) {
      await db.consent.updateMany({
        where: { id: { in: expiredIds } },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ consents: activeConsents, success: true });
  } catch (error: any) {
    console.error("API error /api/consent/list:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

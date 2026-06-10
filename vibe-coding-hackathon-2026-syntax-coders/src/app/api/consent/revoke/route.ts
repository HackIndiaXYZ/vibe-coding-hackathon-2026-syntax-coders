import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { consentId } = body;

    if (!consentId) {
      return NextResponse.json({ message: "Consent ID is required" }, { status: 400 });
    }

    const consent = await db.consent.findUnique({
      where: { id: consentId },
    });

    if (!consent) {
      return NextResponse.json({ message: "Consent not found" }, { status: 404 });
    }

    // Security check: ensure this consent belongs to the requesting patient
    if (consent.patientId !== authUser.sub) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Set isActive to false
    await db.consent.update({
      where: { id: consentId },
      data: { isActive: false },
    });

    // Create access log
    await db.accessLog.create({
      data: {
        patientId: authUser.sub,
        doctorEmail: consent.doctorEmail,
        doctorName: consent.doctorName,
        action: "access_revoked",
        recordName: "All Medical Records",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API error /api/consent/revoke:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

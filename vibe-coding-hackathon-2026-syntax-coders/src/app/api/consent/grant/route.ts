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
    const { doctorEmail, doctorName, expiresAt } = body;

    if (!doctorEmail) {
      return NextResponse.json({ message: "Doctor email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(doctorEmail)) {
      return NextResponse.json({ message: "Invalid doctor email address" }, { status: 400 });
    }

    // Check if active consent already exists
    const existingConsent = await db.consent.findFirst({
      where: {
        patientId: authUser.sub,
        doctorEmail: doctorEmail.toLowerCase(),
        isActive: true,
      },
    });

    if (existingConsent) {
      // Check if it's expired
      if (!existingConsent.expiresAt || new Date(existingConsent.expiresAt) > new Date()) {
        return NextResponse.json({ message: "Access already granted" }, { status: 400 });
      } else {
        // If expired, deactivate it
        await db.consent.update({
          where: { id: existingConsent.id },
          data: { isActive: false }
        });
      }
    }

    // Parse expiresAt date
    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;

    // Create the consent record
    const consent = await db.consent.create({
      data: {
        patientId: authUser.sub,
        doctorEmail: doctorEmail.toLowerCase(),
        doctorName: doctorName || null,
        expiresAt: parsedExpiresAt,
        isActive: true,
      },
    });

    // Create access log
    await db.accessLog.create({
      data: {
        patientId: authUser.sub,
        doctorEmail: doctorEmail.toLowerCase(),
        doctorName: doctorName || null,
        action: "access_granted",
        recordName: "All Medical Records",
      },
    });

    return NextResponse.json({ consent, success: true }, { status: 201 });
  } catch (error: any) {
    console.error("API error /api/consent/grant:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

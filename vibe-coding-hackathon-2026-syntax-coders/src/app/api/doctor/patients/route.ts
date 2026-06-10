import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (authUser.role !== "DOCTOR") {
      return NextResponse.json({ message: "Forbidden: Doctors only" }, { status: 403 });
    }

    // Get doctor's own user record to find their email
    const doctorUser = await db.user.findUnique({
      where: { id: authUser.sub },
      select: { email: true, name: true },
    });

    if (!doctorUser) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    const now = new Date();

    // Find all active, non-expired consents for this doctor's email
    const consents = await db.consent.findMany({
      where: {
        doctorEmail: doctorUser.email,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const patients = consents.map((c) => ({
      consentId: c.id,
      patientId: c.patientId,
      patientName: c.patient.name,
      patientEmail: c.patient.email,
      consentGrantedAt: c.createdAt,
      consentExpiresAt: c.expiresAt,
    }));

    return NextResponse.json({ patients, success: true });
  } catch (error: any) {
    console.error("API error /api/doctor/patients:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

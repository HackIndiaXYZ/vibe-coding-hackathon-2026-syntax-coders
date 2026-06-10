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

    const doctorUser = await db.user.findUnique({
      where: { id: authUser.sub },
      select: { email: true },
    });

    if (!doctorUser) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    // Get all access logs where this doctor has accessed patient data
    const logs = await db.accessLog.findMany({
      where: { doctorEmail: doctorUser.email },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        patientId: true,
        action: true,
        recordName: true,
        createdAt: true,
        patient: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("API error /api/doctor/audit-logs:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

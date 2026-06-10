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

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ message: "patientId query param required" }, { status: 400 });
    }

    // Verify the doctor has consent from this patient
    const doctorUser = await db.user.findUnique({
      where: { id: authUser.sub },
      select: { email: true },
    });

    if (!doctorUser) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    const now = new Date();
    const consent = await db.consent.findFirst({
      where: {
        patientId,
        doctorEmail: doctorUser.email,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    if (!consent) {
      return NextResponse.json(
        { message: "No active consent from this patient" },
        { status: 403 }
      );
    }

    // Fetch the patient's records
    const patient = await db.user.findUnique({
      where: { id: patientId },
      select: { id: true, name: true, email: true },
    });

    // Fetch reports via patient profile relation
    const patientProfile = await db.patient.findUnique({
      where: { userId: patientId },
      include: {
        reports: {
          orderBy: { uploadedAt: "desc" },
          select: {
            id: true,
            fileName: true,
            reportType: true,
            uploadedAt: true,
            fileUrl: true,
            fileSize: true,
            ipfsCid: true,
          },
        },
        aiAnalyses: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            aiSummary: true,
            riskLevel: true,
            recommendedAction: true,
            createdAt: true,
          },
        },
      },
    });

    // Log this record access
    await db.accessLog.create({
      data: {
        patientId,
        doctorEmail: doctorUser.email,
        doctorName: (await db.user.findUnique({ where: { id: authUser.sub }, select: { name: true } }))?.name || "Doctor",
        action: "record_viewed",
        recordName: `Patient records viewed`,
      },
    });

    return NextResponse.json({
      success: true,
      patient,
      reports: patientProfile?.reports || [],
      analyses: patientProfile?.aiAnalyses || [],
    });
  } catch (error: any) {
    console.error("API error /api/doctor/patient-records:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

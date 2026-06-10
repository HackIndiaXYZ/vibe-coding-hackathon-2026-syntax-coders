import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (authUser.role !== "DOCTOR") {
      return NextResponse.json({ message: "Forbidden: Doctors only" }, { status: 403 });
    }

    const body = await req.json();
    const { patientId, symptoms, notes } = body;

    if (!patientId || !symptoms) {
      return NextResponse.json({ message: "patientId and symptoms are required" }, { status: 400 });
    }

    // Verify the doctor has consent from this patient
    const doctorUser = await db.user.findUnique({
      where: { id: authUser.sub },
      select: { email: true, name: true },
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

    // Get patient info for context
    const patient = await db.user.findUnique({
      where: { id: patientId },
      select: { name: true },
    });

    const systemPrompt = `You are an AI clinical triage assistant helping licensed doctors quickly assess patient conditions. 
    You are NOT providing direct patient care. This is a clinical decision SUPPORT tool for verified medical professionals.
    
    Respond with a structured JSON object containing:
    - triagePriority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "ROUTINE"
    - clinicalSummary: A concise 2-3 sentence medical summary
    - differentialDiagnosis: Array of 3-5 possible diagnoses (strings)
    - recommendedTests: Array of recommended diagnostic tests
    - treatmentSuggestions: Array of clinical management suggestions
    - redFlags: Array of warning signs to watch for
    - followUpTimeline: Recommended follow-up timeframe
    - confidenceScore: Number 0-100 indicating AI confidence
    
    Base your assessment on the symptoms provided and any doctor notes.`;

    const userMessage = `Patient: ${patient?.name || "Unknown"}
    
Presenting Symptoms: ${symptoms}
${notes ? `\nDoctor's Additional Notes: ${notes}` : ""}

Please provide a comprehensive clinical triage assessment.`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const rawContent = chatResponse.choices[0]?.message?.content || "{}";

    // Parse JSON from response
    let triageResult: any = {};
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        triageResult = JSON.parse(jsonMatch[0]);
      }
    } catch {
      triageResult = {
        triagePriority: "MEDIUM",
        clinicalSummary: rawContent,
        differentialDiagnosis: [],
        recommendedTests: [],
        treatmentSuggestions: [],
        redFlags: [],
        followUpTimeline: "As clinically indicated",
        confidenceScore: 50,
      };
    }

    // Log this AI triage action
    await db.accessLog.create({
      data: {
        patientId,
        doctorEmail: doctorUser.email,
        doctorName: doctorUser.name,
        action: "ai_triage_run",
        recordName: `AI Triage: ${symptoms.slice(0, 60)}`,
      },
    });

    return NextResponse.json({ success: true, triage: triageResult });
  } catch (error: any) {
    console.error("API error /api/doctor/ai-triage:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

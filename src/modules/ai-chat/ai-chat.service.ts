import Groq from "groq-sdk";
import { prisma } from "../../db/prisma";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "placeholder",
});

const SYSTEM_PROMPT = `You are LifeLink's AI health assistant. Help patients understand their symptoms and provide first-level triage. Always respond with empathy. At the END of every response, output exactly this JSON block on a new line:
{"riskLevel": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "escalate": true|false}
CRITICAL/HIGH = chest pain, stroke, severe bleeding, breathing difficulty.
Always remind users you are not a doctor. Never diagnose.`;

export async function processChat(patientId: string, message: string, conversationHistory: { role: "user" | "assistant" | "system", content: string }[]) {
  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: message }
  ];

  const completion = await groq.chat.completions.create({
    messages,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  });

  const responseContent = completion.choices[0]?.message?.content || "";
  
  let riskLevel = "LOW";
  let escalate = false;
  let reply = responseContent;

  try {
    const jsonStart = responseContent.lastIndexOf("{");
    const jsonEnd = responseContent.lastIndexOf("}");
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonStr = responseContent.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed.riskLevel) riskLevel = parsed.riskLevel;
      if (typeof parsed.escalate === 'boolean') escalate = parsed.escalate;
      
      reply = responseContent.substring(0, jsonStart).trim();
    }
  } catch (error) {
    console.error("Failed to parse Groq JSON block:", error);
  }

  // Save interaction to AiAnalysis table
  await prisma.aiAnalysis.create({
    data: {
      patientId,
      symptomsInput: message,
      aiSummary: reply,
      riskLevel,
      recommendedAction: escalate ? "Escalation to a doctor is recommended." : "Monitor symptoms.",
      needsDoctorReview: escalate
    }
  });

  const updatedHistory = [
    ...conversationHistory,
    { role: "user", content: message },
    { role: "assistant", content: responseContent }
  ];

  return { reply, riskLevel, escalate, updatedHistory };
}

export async function getChatHistory(patientId: string) {
  return await prisma.aiAnalysis.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" }
  });
}

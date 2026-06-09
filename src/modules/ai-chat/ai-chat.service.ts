import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../../db/prisma";

const SYSTEM_PROMPT = `You are LifeLink's AI health assistant. Help patients understand their symptoms and provide first-level triage. Always respond with empathy. Ask follow-up questions to understand the patient's condition better, just like a doctor would.

Rules:
- Be conversational and caring
- Ask 1-2 follow-up questions when needed to understand symptoms better
- Provide helpful advice but always remind you are NOT a doctor
- If symptoms sound serious (chest pain, stroke signs, severe bleeding, breathing difficulty), urge them to seek immediate medical help
- Keep responses concise (2-4 paragraphs max)
- At the END of every response, output exactly this JSON block on a new line:
{"riskLevel": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "escalate": true|false}
CRITICAL/HIGH = chest pain, stroke, severe bleeding, breathing difficulty.
Never diagnose. Always recommend consulting a real doctor for proper diagnosis.`;

function getMockResponse(message: string): string {
  const normalized = message.toLowerCase();
  
  if (normalized.includes("chest pain") || normalized.includes("breathing") || normalized.includes("stroke")) {
    return `I'm concerned about the symptoms you're describing. Chest pain and breathing difficulties can sometimes indicate serious conditions that need immediate attention.

**Please seek medical help immediately** — call emergency services or visit the nearest hospital right away. Don't wait.

While you wait, try to stay calm, sit upright, and avoid any physical exertion. Is there someone with you who can help?

{"riskLevel": "CRITICAL", "escalate": true}`;
  }
  
  if (normalized.includes("fever") || normalized.includes("headache") || normalized.includes("cold") || normalized.includes("cough")) {
    return `I understand you're not feeling well. Let me ask a few questions to better understand your condition:

1. **How long** have you been experiencing these symptoms?
2. **How high** is your temperature (if you've measured it)?
3. Are you experiencing any **other symptoms** like body ache, sore throat, or nausea?

In the meantime, make sure you're staying hydrated, getting rest, and you can take paracetamol for fever if needed. 🤒

{"riskLevel": "LOW", "escalate": false}`;
  }
  
  if (normalized.includes("stomach") || normalized.includes("vomit") || normalized.includes("nausea") || normalized.includes("diarrhea")) {
    return `I'm sorry you're dealing with stomach issues. These can be quite uncomfortable. Let me understand better:

1. **When did this start** — was it sudden or gradual?
2. **Did you eat anything unusual** recently?
3. Are you able to **keep liquids down**?

For now, try sipping small amounts of water or oral rehydration solution (ORS). Avoid heavy or spicy food until you feel better.

{"riskLevel": "MEDIUM", "escalate": false}`;
  }
  
  return `Thank you for sharing that with me. I want to help you understand what might be going on.

Could you tell me a bit more?
1. **When did you first notice** these symptoms?
2. **How severe** would you rate them on a scale of 1-10?
3. Is there anything that **makes it better or worse**?

This will help me give you better guidance. Remember, I'm an AI assistant — for a proper diagnosis, please consult with a qualified doctor. 💙

{"riskLevel": "LOW", "escalate": false}`;
}

export async function processChat(patientId: string, message: string, conversationHistory: { role: "user" | "assistant" | "system", content: string }[]) {
  let responseContent: string;

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log("Using Mock AI chat (No Gemini API Key).");
    responseContent = getMockResponse(message);
  } else {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const chatHistory = conversationHistory.map(msg => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.content }],
      })).filter(msg => msg.role === "user" || msg.role === "model");

      const chat = model.startChat({
        history: chatHistory,
        systemInstruction: SYSTEM_PROMPT,
      });

      const result = await chat.sendMessage(message);
      responseContent = result.response.text();
    } catch (err: any) {
      console.error("Gemini chat failed, falling back to mock:", err.message);
      responseContent = getMockResponse(message);
    }
  }

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
    console.error("Failed to parse AI JSON block:", error);
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
    { role: "user" as const, content: message },
    { role: "assistant" as const, content: responseContent }
  ];

  return { reply, riskLevel, escalate, updatedHistory };
}

export async function getChatHistory(patientId: string) {
  return await prisma.aiAnalysis.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" }
  });
}

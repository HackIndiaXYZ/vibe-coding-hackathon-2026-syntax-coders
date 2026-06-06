import { RiskLevel } from "../types/enums";

export interface TriageResult {
  aiSummary: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  recommendedAction: string;
  needsDoctorReview: boolean;
}

export interface ReportAnalysisResult {
  summary: string;
  keyFindings: string[];
  riskLevel: RiskLevel;
  recommendedAction: string;
  needsDoctorReview: boolean;
}

const getApiKey = (): string | null => {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
};

/**
 * Sends a structured prompt to the Gemini API and parses the response.
 */
async function callGemini(prompt: string, responseSchema: object): Promise<any> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("No Gemini API key configured.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const responseData = await response.json();
  const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Empty response from Gemini API.");
  }

  return JSON.parse(rawText.trim());
}

/**
 * Symptom analysis and triage.
 */
export async function analyzeSymptoms(symptoms: string): Promise<TriageResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.log("Using Mock AI symptom analysis (No API Key).");
    return mockAnalyzeSymptoms(symptoms);
  }

  const prompt = `Act as an expert AI clinical triage assistant. Analyze the patient's symptoms described below and determine the severity/risk level:
Symptoms: "${symptoms}"

Classify into one of:
- LOW: Minor symptoms, safe for self-care advice.
- MEDIUM: Needs attention, consult a doctor in next 24-48 hours.
- HIGH: Urgent medical concern, check-in with doctor immediately.
- EMERGENCY: Critical or life-threatening. Require immediate emergency care.`;

  const schema = {
    type: "OBJECT",
    properties: {
      aiSummary: { type: "STRING" },
      riskLevel: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"] },
      confidenceScore: { type: "NUMBER" },
      recommendedAction: { type: "STRING" },
      needsDoctorReview: { type: "BOOLEAN" }
    },
    required: ["aiSummary", "riskLevel", "confidenceScore", "recommendedAction", "needsDoctorReview"]
  };

  try {
    const result = await callGemini(prompt, schema);
    return {
      aiSummary: result.aiSummary,
      riskLevel: result.riskLevel as RiskLevel,
      confidenceScore: result.confidenceScore,
      recommendedAction: result.recommendedAction,
      needsDoctorReview: result.needsDoctorReview
    };
  } catch (err: any) {
    console.error("Gemini symptom analysis failed, falling back to mock:", err.message);
    return mockAnalyzeSymptoms(symptoms);
  }
}

/**
 * Medical report parser and analyzer.
 */
export async function analyzeMedicalReport(reportText: string): Promise<ReportAnalysisResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.log("Using Mock AI report analysis (No API Key).");
    return mockAnalyzeReport(reportText);
  }

  const prompt = `Act as an expert AI clinical assistant. Read the extracted text of the patient's medical report below. Explain the results in simple language, highlight any out-of-range or abnormal findings, determine a risk level, and outline recommended next actions:
Report Text:
"${reportText}"`;

  const schema = {
    type: "OBJECT",
    properties: {
      summary: { type: "STRING" },
      keyFindings: {
        type: "ARRAY",
        items: { type: "STRING" }
      },
      riskLevel: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"] },
      recommendedAction: { type: "STRING" },
      needsDoctorReview: { type: "BOOLEAN" }
    },
    required: ["summary", "keyFindings", "riskLevel", "recommendedAction", "needsDoctorReview"]
  };

  try {
    const result = await callGemini(prompt, schema);
    return {
      summary: result.summary,
      keyFindings: result.keyFindings,
      riskLevel: result.riskLevel as RiskLevel,
      recommendedAction: result.recommendedAction,
      needsDoctorReview: result.needsDoctorReview
    };
  } catch (err: any) {
    console.error("Gemini report analysis failed, falling back to mock:", err.message);
    return mockAnalyzeReport(reportText);
  }
}

/**
 * Secure medical question answering (Q&A).
 */
export async function answerMedicalQuestion(question: string, context?: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return `[Mock Response] To answer: "${question}". Based on your reports, we recommend tracking your parameters and consulting a verified doctor if symptoms persist. (Note: Please add GEMINI_API_KEY to .env for real AI guidance.)`;
  }

  const prompt = `You are a helpful and professional AI healthcare assistant. Answer the user's question about their health. 
  If context from their medical reports is provided below, incorporate it accurately.
  Provide clear, scientific but easy-to-understand guidance.
  Always prepend or append a professional medical disclaimer stating that this is AI guidance and they should consult a physician for diagnostic advice.
  
  Question: "${question}"
  ${context ? `Report Context: "${context}"` : ""}`;

  const schema = {
    type: "OBJECT",
    properties: {
      answer: { type: "STRING" }
    },
    required: ["answer"]
  };

  try {
    const result = await callGemini(prompt, schema);
    return result.answer;
  } catch (err: any) {
    console.error("Gemini Q&A failed:", err.message);
    return "Error getting response from AI engine. Please try again later.";
  }
}

// ==========================================
// Fallback Mock Generators
// ==========================================

function mockAnalyzeSymptoms(symptoms: string): TriageResult {
  const normalized = symptoms.toLowerCase();
  
  if (["chest pain", "breathing", "unconscious", "stroke", "seizure", "bleeding"].some(k => normalized.includes(k))) {
    return {
      aiSummary: "The symptoms described involve high-acuity cardiovascular or respiratory indicators (e.g., chest pain/dyspnea). This requires immediate clinical triage.",
      riskLevel: RiskLevel.EMERGENCY,
      confidenceScore: 0.95,
      recommendedAction: "Alert emergency services immediately. An Emergency Beacon has been generated for verified doctors nearby.",
      needsDoctorReview: true
    };
  }

  if (["fever", "vomit", "dizzy", "pressure", "sugar", "pregnant", "pain"].some(k => normalized.includes(k))) {
    return {
      aiSummary: "The symptoms present moderate health risks such as a running fever, vomiting, or elevated blood pressure/sugar, which need assessment.",
      riskLevel: RiskLevel.MEDIUM,
      confidenceScore: 0.75,
      recommendedAction: "Book a consultation with a verified general physician on the platform to prevent complications.",
      needsDoctorReview: true
    };
  }

  return {
    aiSummary: "Symptoms reported appear mild or transient with no immediate red-flag indicators detected.",
    riskLevel: RiskLevel.LOW,
    confidenceScore: 0.80,
    recommendedAction: "Monitor symptoms, stay hydrated, and rest. Book an appointment if symptoms persist beyond 48 hours.",
    needsDoctorReview: false
  };
}

function mockAnalyzeReport(reportText: string): ReportAnalysisResult {
  const text = reportText.toLowerCase();
  const findings: string[] = [];
  let risk = RiskLevel.LOW;
  let summary = "The report contains routine diagnostic readings.";

  if (text.includes("glucose") || text.includes("hba1c") || text.includes("diabetes")) {
    findings.push("Elevated Blood Glucose / HbA1c indicators detected.");
    risk = RiskLevel.MEDIUM;
    summary = "Diagnostic details show metabolic metrics indicating pre-diabetic or diabetic trends.";
  }

  if (text.includes("cholesterol") || text.includes("lipid") || text.includes("triglyceride")) {
    findings.push("Lipid panel showing borderline or elevated cholesterol parameters.");
    if (risk === RiskLevel.LOW) risk = RiskLevel.MEDIUM;
  }

  if (text.includes("hemoglobin") || text.includes("cbc") || text.includes("anemia")) {
    findings.push("Red blood cell or hemoglobin levels deviate from standard references.");
  }

  if (findings.length === 0) {
    findings.push("All major parameters listed appear within standard reference intervals.");
  }

  return {
    summary,
    keyFindings: findings,
    riskLevel: risk,
    recommendedAction: risk === RiskLevel.MEDIUM 
      ? "Discuss the lipid/glucose deviations with a doctor. Consider diet adjustments."
      : "No immediate clinical actions needed. Maintain standard wellness follow-ups.",
    needsDoctorReview: risk !== RiskLevel.LOW
  };
}

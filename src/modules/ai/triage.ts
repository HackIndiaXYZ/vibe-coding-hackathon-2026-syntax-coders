import { RiskLevel } from "../../types/enums";

type TriageResult = {
  aiSummary: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  recommendedAction: string;
  needsDoctorReview: boolean;
};

const emergencyKeywords = [
  "chest pain",
  "shortness of breath",
  "unconscious",
  "stroke",
  "seizure",
  "severe bleeding",
  "suicidal"
];

const mediumKeywords = [
  "fever",
  "vomiting",
  "infection",
  "dizziness",
  "high blood pressure",
  "diabetes",
  "pregnant"
];

export function triageSymptoms(symptomsInput: string): TriageResult {
  const normalized = symptomsInput.toLowerCase();

  if (emergencyKeywords.some((keyword) => normalized.includes(keyword))) {
    return {
      aiSummary: "Symptoms include possible emergency warning signs.",
      riskLevel: RiskLevel.EMERGENCY,
      confidenceScore: 0.82,
      recommendedAction: "Seek emergency medical help immediately and notify an available doctor.",
      needsDoctorReview: true
    };
  }

  if (mediumKeywords.some((keyword) => normalized.includes(keyword))) {
    return {
      aiSummary: "Symptoms may need medical review depending on duration and severity.",
      riskLevel: RiskLevel.MEDIUM,
      confidenceScore: 0.68,
      recommendedAction: "Book a doctor consultation and monitor symptoms closely.",
      needsDoctorReview: true
    };
  }

  return {
    aiSummary: "Symptoms do not match the current emergency keyword rules.",
    riskLevel: RiskLevel.LOW,
    confidenceScore: 0.55,
    recommendedAction: "Provide basic self-care guidance and ask follow-up questions.",
    needsDoctorReview: false
  };
}

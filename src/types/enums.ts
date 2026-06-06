export enum UserRole {
  PATIENT = "PATIENT",
  DOCTOR = "DOCTOR",
  ADMIN = "ADMIN"
}

export enum DoctorVerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum AppointmentStatus {
  REQUESTED = "REQUESTED",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  EMERGENCY = "EMERGENCY"
}

export enum EscalationStatus {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  RESOLVED = "RESOLVED"
}

# LifeLink Backend Architecture

LifeLink is an AI-assisted healthcare coordination platform. The key idea is not that AI replaces doctors. The AI gives first-level guidance, report explanation, risk detection, and emergency triage. Doctors handle high-risk, uncertain, or consultation-worthy cases.

## Why This Backend Stack

We are using TypeScript, Express, Prisma, and PostgreSQL.

TypeScript helps us catch mistakes while building. Express keeps the API simple and easy to understand. Prisma gives us a readable database schema and safer database queries. PostgreSQL is a strong fit because healthcare data has relationships: users have patient or doctor profiles, patients have reports, reports have AI analyses, and appointments connect patients with doctors.

## First Decision: Separate User From Role Profiles

The `User` table stores login identity: name, email, password hash, and role.

The `Patient` table stores patient-specific health profile data.

The `Doctor` table stores doctor-specific professional data like specialization, license number, and verification status.

We do this because authentication and profile data are different concerns. A user account answers "who are you?" A role profile answers "what healthcare-specific data belongs to you?"

## Core Schema Logic

`User -> Patient` is one-to-one. A patient login has one patient profile.

`User -> Doctor` is one-to-one. A doctor login has one doctor profile.

`Patient -> MedicalReport` is one-to-many. A patient can upload many reports.

`MedicalReport -> AiAnalysis` is one-to-many. The same report may be analyzed again as models or context improve.

`Patient + Doctor -> Appointment` connects the two parties.

`Appointment -> Consultation` stores the final doctor's notes, diagnosis, prescription, and follow-up.

`AiAnalysis -> EmergencyCase` connects AI risk detection to emergency escalation.

`AuditLog` records sensitive actions, such as viewing medical data or changing doctor verification.

## Auth And Security Plan

Passwords must be hashed with bcrypt or Argon2. We never store plain text passwords.

The backend will issue short-lived access tokens and longer-lived refresh tokens. Access tokens protect normal API requests. Refresh tokens let users get a new access token without logging in again.

Authorization is role-based:

- Patients can access only their own reports, appointments, and AI analyses.
- Doctors can access assigned appointments and emergency cases.
- Admins can verify doctors and inspect platform-level records.

This distinction matters in interviews: authentication proves identity; authorization controls allowed actions.

## AI Safety Decision

The AI should not be treated as a final medical authority. It should return a risk level, confidence score, summary, and recommended action.

High-risk or low-confidence cases should be escalated to a doctor. That is why `AiAnalysis` has `riskLevel`, `confidenceScore`, and `needsDoctorReview`.

## Blockchain And IPFS Decision

Medical data should not be stored directly on blockchain. Blockchain data is hard to delete and can create privacy problems.

The safer design is:

- Store medical files in secure object storage or IPFS.
- Store file hashes or consent records on-chain only if verification is needed.
- Keep private patient data in PostgreSQL and secure storage.

## Current Step

This first step creates the backend foundation:

- A TypeScript Express server.
- Environment validation.
- Security middleware.
- Health route.
- Prisma schema for the main database design.

## Next Step

The next step is authentication:

1. Add Prisma client connection.
2. Add register and login APIs.
3. Hash passwords before saving.
4. Return JWT tokens after login.
5. Add middleware to protect routes.

# Step 4: Reports And AI Triage

This step adds the first real LifeLink healthcare workflows.

## What We Built

We added:

- Patient-only report metadata APIs.
- Patient-only symptom analysis APIs.
- A simple triage engine.
- Automatic emergency case creation for emergency symptoms.

## Report Flow

Patients can create report records with:

```text
fileUrl
fileHash
storageType
reportType
```

Right now this stores metadata only. In a full version, file upload would happen through secure object storage, then the backend would save the resulting URL and hash.

We do this because databases should not usually store large medical files directly. The database stores metadata and relationships. Storage systems store files.

## AI Triage Flow

The patient sends symptoms:

```text
POST /ai/analyze-symptoms
```

The backend:

1. Confirms the user is authenticated.
2. Confirms the user has the `PATIENT` role.
3. Finds the patient profile.
4. Runs symptom triage.
5. Saves an `AiAnalysis`.
6. Creates an `EmergencyCase` if risk is emergency.

## Why The Current AI Is Rule-Based

The current triage logic is intentionally simple. It checks for emergency and medium-risk keywords.

This is not the final AI system. It is a safe placeholder that lets us build the backend workflow first.

That is a good engineering decision because the core backend flow should work before depending on an external AI service.

Later, this rule-based function can be replaced with a real AI model call while keeping the same API and database structure.

## Safety Logic

The AI result stores:

```text
aiSummary
riskLevel
confidenceScore
recommendedAction
needsDoctorReview
```

This is important because the system should explain why it made a recommendation and whether a doctor needs to review it.

Emergency symptoms create an `EmergencyCase`. That separates normal AI guidance from urgent escalation.

## Routes Added

```text
POST /reports
GET  /reports
POST /ai/analyze-symptoms
GET  /ai/analyses
```

All four routes require a patient access token.

## Interview Explanation

I separated report storage from AI analysis. Reports represent uploaded medical documents or metadata. AI analyses represent interpretations of symptoms or reports. This separation allows the same report to be analyzed multiple times, keeps AI output auditable, and makes emergency escalation easier. The first triage implementation is rule-based so the backend workflow is testable before integrating an external AI provider.

## Next Step

Step 5 should add doctor and admin workflows:

1. Admin verifies doctors.
2. Patients list approved doctors.
3. Patients book appointments.
4. Doctors view assigned appointments.
5. Doctors create consultation notes.

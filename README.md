# LifeLink Backend

LifeLink is an AI-assisted healthcare coordination backend. The goal is to let AI handle first-level triage, medical report explanation, and emergency detection while escalating serious or uncertain cases to verified doctors.

## Step 1: Backend Foundation

We created the first backend foundation with:

- TypeScript for safer code.
- Express for the HTTP API.
- Prisma for database schema and queries.
- PostgreSQL as the main relational database.
- Helmet and CORS for basic API security.
- Zod for environment validation.

## Why This Matters

This project deals with healthcare-style data, so the backend must be designed carefully from the beginning. We separated users, patients, doctors, reports, AI analyses, appointments, consultations, emergency cases, and audit logs.

That separation makes the system easier to explain, secure, and scale.

## Current Folder Structure

```text
src/
  app.ts
  server.ts
  config/
    env.ts
  modules/
    health/
      health.routes.ts
prisma/
  schema.prisma
docs/
  01-backend-architecture.md
```

## How To Run Locally

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as the template.

Build the project:

```bash
npm run build
```

In PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd run build
```

Run the development server:

```bash
npm run dev
```

Or in PowerShell:

```bash
npm.cmd run dev
```

Health check:

```text
GET http://localhost:4000/health
```

## Interview Explanation

LifeLink has three main actors: patients, doctors, and admins. A user account stores authentication data. Patient and doctor profiles store role-specific information. Patients can upload medical reports and symptoms. AI analyzes the information and returns a risk level. Low-risk cases can receive guidance, while high-risk or uncertain cases are escalated to doctors.

The AI is not the final medical authority. It is a decision-support layer. Doctors remain responsible for important medical decisions.

## Next Step

Step 2 has been added. It includes patient registration, doctor registration, login, JWT creation, auth middleware, and centralized error handling.

Read:

```text
docs/02-authentication.md
```

## Next Step

Step 3 is database setup and migrations:

1. Install or connect PostgreSQL.
2. Create the LifeLink database.
3. Create a real `.env` file.
4. Run Prisma migration.
5. Test auth routes against the database.

Read:

```text
docs/03-database-setup.md
```

Step 4 has also been added. It includes patient report metadata and AI symptom triage.

Read:

```text
docs/04-reports-and-ai-triage.md
```

Step 5 has been added. It includes admin doctor verification, approved doctor listing, appointment booking, and consultation creation.

Read:

```text
docs/05-doctor-admin-appointments.md
```

Step 6 has been added. It includes a seed script for creating the first admin.

Read:

```text
docs/06-seeding-and-api-testing.md
```

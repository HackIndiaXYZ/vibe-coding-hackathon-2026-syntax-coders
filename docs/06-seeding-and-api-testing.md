# Step 6: Seeding And API Testing

This step prepares the project for real end-to-end testing.

## What We Added

We added a seed script that creates the first admin user.

The file is:

```text
prisma/seed.ts
```

The command is:

```bash
npm.cmd run seed
```

This must be run after the database exists and migrations are applied.

## Why A Seed Script Is Needed

Admin routes are protected by the `ADMIN` role.

That creates a bootstrapping problem:

```text
Only admins can verify doctors.
But someone must create the first admin.
```

A seed script solves this safely for development. It creates the first admin from environment variables instead of exposing a public `/register/admin` route.

That is safer because public admin registration would be a major security risk.

## Seed Environment Variables

```text
SEED_ADMIN_NAME
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
```

In production, these should come from a secure secret manager or a one-time deployment process.

## End-To-End Test Order

Once PostgreSQL is running:

```bash
npm.cmd run prisma:migrate -- --name init
npm.cmd run seed
npm.cmd run dev
```

Then test in this order:

1. Login as admin.
2. Register a doctor.
3. Admin approves the doctor.
4. Register a patient.
5. Patient lists approved doctors.
6. Patient books an appointment.
7. Doctor logs in and views appointments.
8. Doctor confirms or completes the appointment.
9. Doctor creates consultation notes.
10. Patient submits symptoms and gets AI triage.

## Interview Explanation

I avoided public admin registration because it would create a security hole. Instead, the first admin is created through a seed script using environment variables. This keeps privileged account creation separate from normal user registration and makes the system safer to deploy.

## Next Step

After PostgreSQL is available, the next task is live API testing. Then we can add file uploads, real AI integration, and notification workflows.

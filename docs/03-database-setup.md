# Step 3: Database Setup And Migrations

This step makes the backend database real.

## What We Added

We added:

- A real local `.env` file.
- `docker-compose.yml` for PostgreSQL.
- `db:up` and `db:down` scripts.

## Why PostgreSQL

LifeLink has relational data:

- A user has one patient or doctor profile.
- A patient has many reports.
- Reports can have many AI analyses.
- Patients and doctors are connected through appointments.
- Appointments can become consultations.
- AI analyses can create emergency cases.

PostgreSQL handles this kind of structured relationship well. It also gives us constraints, unique fields, transactions, indexes, and reliable migrations.

## Why Docker Compose

Docker Compose gives everyone the same local database setup. Instead of manually installing PostgreSQL and configuring users/databases, one command can start a development database.

```bash
npm run db:up
```

In PowerShell, use:

```bash
npm.cmd run db:up
```

## Why `.env` Exists

The `.env` file stores environment-specific values:

```text
DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
PORT
```

These values should not be hardcoded inside source files. In production, secrets must come from the deployment platform or secret manager.

The `.env` file is gitignored because it can contain passwords and signing secrets.

## Migration Logic

Prisma migrations convert the schema design into real database tables.

The schema lives in:

```text
prisma/schema.prisma
```

To create the first migration:

```bash
npm run prisma:migrate -- --name init
```

In PowerShell:

```bash
npm.cmd run prisma:migrate -- --name init
```

This creates SQL migration files and applies them to PostgreSQL.

## Interview Explanation

I used PostgreSQL because the project has strongly related entities and needs data integrity. Prisma gives a clear schema, type-safe queries, and migration history. Docker Compose makes local database setup repeatable. Environment variables keep secrets and deployment-specific configuration out of the codebase.

## Next Step

After the database is running and migrations are applied, we test authentication APIs:

1. Register a patient.
2. Register a doctor.
3. Login.
4. Call `/auth/me` using the access token.
5. Confirm the password hash is stored, not the raw password.

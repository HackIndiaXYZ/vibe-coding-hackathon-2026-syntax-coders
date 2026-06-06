# Step 2: Authentication

Authentication answers one question: who is making this request?

Authorization answers a different question: what is this user allowed to do?

LifeLink needs both because patients, doctors, and admins must not have the same access.

## What We Built

We added:

- Patient registration.
- Doctor registration.
- Login.
- JWT access and refresh token creation.
- Protected `/auth/me` route.
- Auth middleware.
- Role-check middleware.
- Centralized API error handling.

## Why Passwords Are Hashed

The backend never stores the real password. During registration, the password is passed through bcrypt and only the hash is saved.

If the database leaks, attackers should not immediately get user passwords. Hashing does not make breaches harmless, but it greatly reduces damage.

## Why Patient And Doctor Registration Are Separate

Patients and doctors share normal login fields such as name, email, phone, and password.

But they have different profile fields:

- Patients have health profile data.
- Doctors have specialization, license number, experience, fee, and verification status.

Separate endpoints make validation clearer and avoid mixing two different workflows.

## Why Doctor Verification Exists

A doctor account starts with `PENDING` verification.

This prevents random users from registering as doctors and immediately accessing patient-related workflows. Later, an admin will approve or reject doctors.

## Why We Return Tokens

After registration or login, the API returns:

- `accessToken`
- `refreshToken`

The access token is short-lived and used for normal private API calls. The refresh token lasts longer and can be used later to get a new access token.

This is better than one long-lived token because stolen access tokens expire quickly.

## Why The Token Contains User Id And Role

The access token stores:

```text
sub = user id
role = PATIENT, DOCTOR, or ADMIN
```

The user id lets the backend know which account is making the request. The role lets middleware quickly block routes that the user should not access.

We do not put sensitive medical data inside the token.

## Routes Added

```text
POST /auth/register/patient
POST /auth/register/doctor
POST /auth/login
GET  /auth/me
```

## Example Login Flow

1. User sends email and password.
2. Backend finds the user by email.
3. Backend compares the password with the saved hash.
4. If valid, backend returns safe user data and tokens.
5. Frontend stores the access token and sends it in future requests.

Future private request:

```text
Authorization: Bearer <accessToken>
```

## Interview Explanation

I separated authentication from role-specific profile data. The `User` model handles login identity, while `Patient` and `Doctor` store domain-specific data. Passwords are hashed with bcrypt. JWT access tokens are used for protected routes, and role-based middleware controls whether a patient, doctor, or admin can access a route. Doctor accounts are created in a pending state so admins can verify licenses before doctors can perform sensitive actions.

## Next Step

Step 3 should be database setup and migrations:

1. Install or connect PostgreSQL.
2. Create the LifeLink database.
3. Create a real `.env` file.
4. Run Prisma migration.
5. Test auth routes against the database.

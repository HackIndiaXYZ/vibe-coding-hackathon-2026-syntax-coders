# Step 5: Doctor, Admin, And Appointment Workflows

This step connects the people in the system: admins, doctors, and patients.

## What We Built

We added:

- Admin doctor verification routes.
- Public approved-doctor listing for authenticated users.
- Patient appointment booking.
- Patient and doctor appointment views.
- Doctor appointment status updates.
- Doctor consultation creation.

## Why Admin Verification Matters

In a healthcare platform, a doctor should not become fully active immediately after registration.

Doctor registration creates the doctor with:

```text
verificationStatus = PENDING
```

An admin must change the status to:

```text
APPROVED
```

Only approved doctors can be listed for patients and booked for appointments.

This protects patients from unverified providers and gives the platform a control point.

## Admin Flow

Routes:

```text
GET   /admin/doctors/pending
PATCH /admin/doctors/:doctorId/verification
```

Only users with the `ADMIN` role can access these routes.

When an admin changes a doctor's verification status, the backend also creates an audit log. This matters because sensitive administrative decisions should be traceable.

## Doctor Listing Flow

Route:

```text
GET /doctors
```

This returns only approved doctors.

Optional query:

```text
GET /doctors?specialization=cardiology
```

This lets patients search by specialization.

## Appointment Booking Flow

Route:

```text
POST /appointments
```

Only patients can book appointments.

The backend checks:

1. The user is authenticated.
2. The user has the `PATIENT` role.
3. The patient profile exists.
4. The selected doctor exists.
5. The doctor is approved.

Then it creates an appointment with:

```text
status = REQUESTED
```

## Doctor Appointment Flow

Route:

```text
GET /appointments/mine
```

Patients see their own appointments. Doctors see appointments assigned to them.

Doctors can update appointment status:

```text
PATCH /appointments/:appointmentId/status
```

Allowed statuses:

```text
CONFIRMED
COMPLETED
CANCELLED
```

Doctors can also create consultation notes:

```text
POST /appointments/consultations
```

When a consultation is created, the appointment becomes completed.

## Security Logic

The important access rules are:

- Admins verify doctors.
- Patients can book only approved doctors.
- Doctors can update only their own appointments.
- Doctors can create consultations only for appointments assigned to them.

This is role-based access control plus ownership checks.

## Interview Explanation

I added doctor verification before appointment booking because healthcare platforms need trust and safety controls. Doctor accounts begin as pending, and admins approve them after verification. Patients can only book approved doctors. Appointment ownership is enforced in the backend, so a doctor cannot update another doctor's appointment. Consultation records are linked to appointments, which keeps the clinical workflow traceable.

## Next Step

Step 6 should add a proper admin creation strategy and testing:

1. Add a seed script to create the first admin.
2. Add API test examples.
3. Run migrations once PostgreSQL or Docker is installed.
4. Test patient, doctor, admin, and appointment flows end to end.

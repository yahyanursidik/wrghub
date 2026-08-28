# Roles & Permissions

## Roles

```text
SUPER_ADMIN
CHAIRMAN
SECRETARY
TREASURER
RESIDENT_ADMIN
SECURITY
MAINTENANCE
HOUSE_OWNER
HOUSEHOLD_HEAD
RESIDENT
AUDITOR
VIEWER
```

## Permission Naming

Gunakan pola:

```text
resource.action
```

Contoh:

```text
property.read
property.create
property.update

person.read
person.update

billing.read
billing.create
billing.update

payment.read
payment.submit
payment.verify
payment.reverse

expense.read
expense.create
expense.approve

ledger.read

report.read
report.publish

announcement.create
announcement.update

complaint.create
complaint.manage

facility.manage

audit.read
```

## Prinsip

Jangan menulis:

```ts
if (user.role === "TREASURER")
```

di banyak tempat.

Gunakan policy:

```ts
can(user, "payment.verify")
```

## Access per Property

Tabel:

```text
user_property_access
```

Field:
- user_id
- property_id
- relationship
- can_view_billing
- can_pay
- can_edit_occupants
- can_view_property
- started_at
- ended_at

## Refine

Gunakan `accessControlProvider` untuk:
- menu visibility,
- resource access,
- action button visibility,
- guard create/edit/delete.

Validasi permission tetap wajib di server.

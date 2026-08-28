# Database Schema

## Core Tables

```text
communities
blocks
properties
property_ownerships
occupancies
persons
households
household_members
users
user_property_access
vehicles
```

## Billing Tables

```text
fee_types
fee_rules
billing_periods
invoices
invoice_items
payments
payment_allocations
payment_verifications
```

## Finance Tables

```text
accounts
ledger_entries
expense_categories
expenses
budgets
budget_items
monthly_snapshots
```

## Operational Tables

```text
announcements
notifications
notification_deliveries
complaints
complaint_updates
facilities
maintenance_requests
documents
decisions
```

## System Tables

```text
audit_logs
system_events
job_runs
settings
```

## Contoh Skema Property

```sql
properties
- id uuid pk
- community_id uuid
- block_id uuid nullable
- code varchar unique
- number varchar
- address text
- occupancy_status varchar
- is_active boolean
- notes text nullable
- created_at timestamptz
- updated_at timestamptz
```

## Invoice

```sql
invoices
- id uuid pk
- property_id uuid
- billing_period_id uuid
- invoice_number varchar unique
- status varchar
- subtotal numeric(14,2)
- total numeric(14,2)
- due_date date
- issued_at timestamptz
- paid_at timestamptz nullable
- created_at timestamptz
- updated_at timestamptz
```

Status:

```text
UNPAID
PARTIAL
PAID
OVERDUE
WAIVED
CANCELLED
```

## Payment

```sql
payments
- id uuid pk
- property_id uuid
- amount numeric(14,2)
- method varchar
- reference varchar nullable
- proof_file_url text nullable
- status varchar
- paid_at timestamptz
- submitted_by uuid nullable
- verified_by uuid nullable
- verified_at timestamptz nullable
- created_at timestamptz
```

Status:

```text
PENDING
VERIFIED
REJECTED
VOID
REVERSED
```

## Ledger

```sql
ledger_entries
- id uuid pk
- account_id uuid
- entry_date date
- direction varchar
- amount numeric(14,2)
- source_type varchar
- source_id uuid
- description text
- created_by uuid
- created_at timestamptz
```

## Monthly Snapshot

```sql
monthly_snapshots
- id uuid pk
- billing_period_id uuid unique
- total_properties integer
- paid_properties integer
- unpaid_properties integer
- opening_balance numeric(14,2)
- income numeric(14,2)
- expense numeric(14,2)
- closing_balance numeric(14,2)
- generated_at timestamptz
```

## Index Penting

Buat index pada:
- properties.code
- occupancies.property_id
- invoices.property_id
- invoices.billing_period_id
- invoices.status
- payments.property_id
- payments.status
- ledger_entries.entry_date
- notifications.user_id
- audit_logs.entity_type + entity_id

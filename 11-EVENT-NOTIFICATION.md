# Event & Notification System

## Domain Events

```text
property.created
property.owner_changed
occupancy.started
occupancy.ended

invoice.created
invoice.overdue

payment.submitted
payment.verified
payment.rejected
payment.reversed

expense.created
expense.approved

complaint.created
complaint.resolved

maintenance.created
maintenance.resolved
```

## Contoh

```text
payment.verified
├── allocate payment
├── update invoice
├── create ledger entry
├── invalidate dashboard
├── invalidate public report
├── create notification
└── audit log
```

## Notification Channels

```text
IN_APP
EMAIL
WHATSAPP
PUSH
```

V1:
- IN_APP
- EMAIL

WhatsApp disiapkan pada abstraction layer.

## Reminder Schedule

Contoh:

```text
Tanggal 1
Invoice dibuat

Tanggal 5
Reminder pertama

Tanggal 10
Jatuh tempo

Tanggal 15
Reminder outstanding

Tanggal 25
Reminder akhir bulan
```

## Idempotency

Job reminder wajib idempotent.

Jangan kirim reminder sama lebih dari satu kali karena retry.

Simpan:

```text
notification_deliveries
job_runs
```

## Notification Center

Portal warga:
- status pembayaran,
- pengumuman,
- perubahan fasilitas,
- reminder iuran.

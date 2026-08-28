# Billing & Finance

## Fee Type

Contoh:
- operasional,
- keamanan,
- kebersihan,
- sampah,
- iuran khusus,
- kegiatan,
- donasi.

## Fee Rule

Field:
- fee_type_id
- amount
- frequency
- effective_from
- effective_until
- due_day
- scope

## Generate Invoice

Proses bulanan:

```text
billing period created
↓
load active properties
↓
load applicable fee rules
↓
generate invoice
↓
generate invoice items
↓
emit invoice.created
```

## Payment Flow

```text
Resident submits payment
↓
PENDING
↓
Treasurer verifies
↓
VERIFIED
↓
Allocate to invoice
↓
Invoice updated
↓
Ledger entry
↓
Notification
↓
Audit log
```

## Tidak Boleh Hard Delete

Pembayaran salah:

```text
VERIFIED
↓
REVERSED
```

dan buat entry koreksi.

## Monthly Closing

Status:

```text
OPEN
CLOSING
CLOSED
LOCKED
```

Setelah `CLOSED`:
- transaksi lama tidak boleh diedit,
- correction dibuat sebagai entry baru.

## Budget

Struktur:

```text
budget
└── budget_items
    ├── security
    ├── cleaning
    ├── electricity
    └── maintenance
```

Laporan:

```text
Budget vs Actual
```

## Ledger Rule

Semua arus kas harus menghasilkan ledger entry.

Source:
- PAYMENT
- EXPENSE
- ADJUSTMENT
- OPENING_BALANCE
- REVERSAL

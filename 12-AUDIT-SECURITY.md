# Audit, Privacy & Security

## Audit Log

Wajib untuk:
- payment verification,
- reversal,
- expense,
- perubahan fee,
- perubahan owner,
- perubahan occupant,
- perubahan permission,
- monthly closing.

Field:

```text
actor_user_id
action
entity_type
entity_id
old_value
new_value
ip_address
user_agent
created_at
```

## Privacy

Public endpoint tidak boleh mengembalikan:
- nama warga,
- telepon,
- email,
- dokumen pribadi,
- kendaraan,
- household detail.

## Authorization

Permission wajib divalidasi server-side.

UI hiding bukan security.

## Data Minimization

Simpan hanya data penghuni yang memang dibutuhkan.

Jangan menambahkan:
- NIK,
- tanggal lahir,
- data kesehatan,

kecuali benar-benar ada kebutuhan yang sah.

## File Upload

Validasi:
- MIME,
- size,
- extension,
- file naming.

Gunakan signed URL untuk file private.

## Financial Integrity

Transaksi finansial tidak boleh hard-delete.

Gunakan:
- VOID
- REVERSED
- CORRECTED

## Rate Limiting

Terapkan pada:
- login,
- public endpoints,
- upload,
- payment submission.

## Backup

Gunakan:
- Neon backup/branching,
- export periodik,
- storage backup untuk dokumen penting.

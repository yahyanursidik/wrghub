# Acceptance Criteria

## Property

- admin dapat menambah rumah,
- rumah memiliki kode unik,
- rumah dapat memiliki histori owner,
- rumah dapat memiliki histori occupancy,
- owner lama tidak terhapus.

## Household

- satu household memiliki head,
- household memiliki member,
- member dapat aktif/nonaktif,
- histori move-in/move-out tercatat.

## Billing

- admin dapat membuat fee type,
- sistem dapat generate invoice bulanan,
- invoice memiliki due date,
- invoice dapat partial,
- outstanding dapat dihitung akurat.

## Payment

- warga dapat submit pembayaran,
- bendahara dapat verify,
- invoice otomatis update,
- ledger otomatis tercatat,
- audit log dibuat,
- notification dibuat.

## Reversal

- payment verified tidak dapat dihapus,
- bendahara dapat reverse,
- reversal membuat koreksi ledger,
- audit log menyimpan alasan.

## Finance

- admin dapat catat expense,
- saldo dapat dihitung,
- monthly report sesuai ledger,
- closing period dapat lock data.

## Transparency

- public report dapat dibuka tanpa login,
- tidak ada nama warga,
- hanya nomor rumah jika mode diaktifkan,
- report menampilkan updated timestamp.

## RBAC

- warga tidak dapat melihat rumah lain,
- bendahara tidak otomatis mendapat superadmin,
- permission server-side berjalan.

## Mobile

Portal warga nyaman pada:
- 360px,
- 390px,
- 430px.

## Performance

- dashboard tidak melakukan N+1 query,
- public report menggunakan snapshot/cache,
- list admin memiliki pagination,
- tabel besar menggunakan server-side filtering.

## Quality

Wajib lolos:
- typecheck,
- lint,
- unit tests,
- integration tests untuk service kritis,
- Playwright untuk alur utama.

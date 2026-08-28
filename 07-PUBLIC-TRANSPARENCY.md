# Public Transparency

## URL

```text
/transparency
/transparency/2026/08
```

## Informasi Publik

Boleh ditampilkan:
- bulan,
- total rumah,
- jumlah lunas,
- jumlah belum,
- persentase pembayaran,
- rumah belum bayar,
- pemasukan,
- pengeluaran,
- saldo,
- kategori penggunaan dana,
- waktu update terakhir.

## Jangan Tampilkan

Jangan tampilkan:
- nama penghuni,
- nomor telepon,
- email,
- bukti transfer,
- identitas pribadi,
- kendaraan,
- detail household.

## Mode Transparansi

```text
OFF
SUMMARY_ONLY
HOUSE_NUMBER
```

## Contoh

```text
Agustus 2026

59 dari 68 rumah telah membayar
86.7%

Belum:
A-03
A-11
B-07

Pemasukan
Rp9.250.000

Pengeluaran
Rp6.725.000

Saldo Akhir
Rp18.275.000
```

## QR

Sediakan QR menuju:

```text
/transparency/current
```

Redirect otomatis ke periode aktif.

## Caching

Public report harus:
- cepat,
- tidak query seluruh transaksi setiap request.

Gunakan:
- monthly snapshot,
- cached aggregate,
- revalidation setelah perubahan finansial.

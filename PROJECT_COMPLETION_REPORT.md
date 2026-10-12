# Laporan kelanjutan WargaHub

Tanggal pemeriksaan: **12 Oktober 2026**.

Pekerjaan audit UI/navigasi dan pengamanan akses yang terhenti sudah dilanjutkan, diperbaiki, dan diverifikasi pada build lokal. Laporan ini menggantikan klaim penyelesaian produksi pada laporan terdahulu, karena klaim tersebut tidak mencerminkan batas fitur dan bukti uji saat ini.

## Hasil yang diverifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Build Astro | Lulus |
| TypeScript strict (`npm run typecheck`) | Lulus |
| Audit navigasi | 22 rute pengurus, 82 referensi API, tanpa target literal yang hilang |
| Browser | 75 halaman/tab, tanpa error browser atau overflow pada matriks uji |
| Ukuran layar navigasi utama | 360, 768, dan 1440 px |
| API privat | 92 metode endpoint menolak akses anonim |
| Integritas jurnal | Persistensi, pembalikan saldo, transfer atomik, dan penolakan saldo kurang lulus pada SQLite sementara |
| Sesi dan peran | Cookie palsu, akses lintas peran/rumah, reset password, perubahan peran, penonaktifan akun, dan logout diuji |
| Aduan | Pengajuan tersimpan dan muncul kembali pada pembacaan server |

Pengujian mutasi memakai database SQLite fixture baru di direktori sementara. Database produksi, kredensial `.env`, dan data browser pengguna tidak dihapus atau direset. Pengujian ini tidak membuktikan seluruh transaksi PostgreSQL atau layanan eksternal sudah siap produksi.

## Perbaikan lanjutan

- Middleware memvalidasi sesi dan peran untuk halaman serta API privat; identitas akun diperiksa ulang dari database.
- Sesi berakhir maksimal tujuh hari dari login. Perubahan password membatalkan sesi lama.
- Identitas SSR memakai sesi server. Cookie JSON lama tidak lagi menjadi sumber identitas portal.
- Perubahan profil memvalidasi seluruh selector dan menargetkan satu rumah yang ada.
- Props dashboard dan notifikasi petugas mengikuti akses peran, termasuk pembatasan data pembayaran.
- Reset akun memakai hash scrypt dan identitas pelaku audit dari sesi.
- Form login mempertahankan spasi password dan tidak menawarkan kredensial demo.
- Fixture tagihan diperbaiki; runner tetap menjalankan tes HTTP apabila tes browser gagal.
- Pengajuan aduan lokal sekarang benar-benar disimpan melalui service.

## Batas pekerjaan berikutnya

Masih diperlukan pengujian staging PostgreSQL untuk verifikasi/pembatalan pembayaran, pengeluaran, cicilan, voting, generasi tagihan, dan konkurensi. Beberapa subfitur penghuni, izin, kendaraan, spesifikasi rumah, serta data operasional lokal belum mempunyai persistensi lengkap. Pembatalan jurnal perlu mempertahankan record lewat reversal, dan deployment beberapa instance memerlukan storage sesi/rate limit bersama. Upload berkas, WhatsApp gateway, serta perangkat gerbang belum diverifikasi sebagai integrasi nyata.

Rincian temuan dan cara mengulang tes tersedia dalam [UI_UX_NAVIGATION_AUDIT.md](UI_UX_NAVIGATION_AUDIT.md). Status yang dapat dipertanggungjawabkan adalah **audit lokal terverifikasi**, bukan serah terima seluruh sistem produksi.

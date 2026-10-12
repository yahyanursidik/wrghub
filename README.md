# WargaHub

Aplikasi pengelolaan lingkungan perumahan: portal warga, iuran dan pembayaran, buku kas, aduan, fasilitas, dokumen, serta transparansi keuangan.

Stack pada checkout ini: Astro 7 SSR, React 19, Tailwind CSS 3, Drizzle ORM, dan Neon PostgreSQL. SQLite tersedia untuk mode lokal dan pengujian terisolasi.

## Menjalankan aplikasi

Gunakan konfigurasi database milik Anda di `.env`; contoh nama variabel tersedia di `.env.example`. Jangan menyalin kredensial asli ke repositori. Untuk mode lokal, kosongkan `DATABASE_URL` dan gunakan database SQLite yang sudah diinisialisasi.

```sh
npm install
npm run dev
```

Build produksi Node:

```sh
npm run build
npm start
```

Alamat default adalah `http://localhost:4321`. Portal warga berada di `/warga`, login di `/login`, dashboard pengurus di `/admin`, dan laporan publik di `/transparency`. Halaman privat memerlukan akun terdaftar serta sesi server yang valid.

## Pengujian

```sh
npm run build
npm run typecheck
npm run test:access
npm run test:authorization
npm run test:ledger
npm run audit:navigation
npm run test:ui
```

`test:ui` membuat fixture SQLite sementara, menjalankan server build pada localhost, menguji seluruh menu/tab melalui Chrome atau Edge headless, lalu menjalankan tes HTTP keamanan. `npm run test:security` menjalankan suite HTTP saja pada fixture baru. Mutasi suite ini tidak diarahkan ke database produksi.

Selesaikan build sebelum menjalankan tes UI/HTTP, dan jangan rebuild `dist` selama tes berlangsung. `CHROME_PATH` menentukan browser, `UI_AUDIT_PORT` menentukan port server, dan `UI_TEST_OUTPUT` menentukan lokasi screenshot. Suite memerlukan izin koneksi localhost pada lingkungan sandbox.

## Status dan dokumentasi

Pemeriksaan 12 Oktober 2026: build dan TypeScript lulus; 75 halaman/tab browser tanpa temuan, dan 92 metode API privat menolak akses anonim. Pemeriksaan lokal tidak menggantikan pengujian transaksi PostgreSQL dan integrasi eksternal.

- [Laporan kelanjutan](PROJECT_COMPLETION_REPORT.md)
- [Audit UI, navigasi, akses, serta temuan terbuka](UI_UX_NAVIGATION_AUDIT.md)
- [Panduan pengguna](MANUAL_PANDUAN_PENGGUNA.md)
- [Roadmap](13-IMPLEMENTATION-ROADMAP.md)

Dokumen menggunakan tautan berkas HTTPS; upload binary belum tersedia. Ekspor merupakan snapshot operasional terbatas, bukan backup lengkap yang dapat dipulihkan otomatis. WhatsApp masih berupa simulator; aktivasi RFID dan perangkat gerbang memerlukan integrasi tersendiri. Rincian fitur yang belum persisten tersedia di laporan audit.

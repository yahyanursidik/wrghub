# Audit UI/UX, navigasi, dan keterhubungan fitur

## Kesimpulan

Audit lanjutan diselesaikan pada **12 Oktober 2026**. Build dan TypeScript lulus; pengujian browser mencakup **75 halaman/tab**, dan pengujian HTTP memeriksa penolakan anonim pada **92 metode endpoint privat**. Tidak ditemukan error browser atau overflow pada matriks menu yang diuji. Seluruh mutasi pengujian memakai fixture SQLite sementara, bukan database produksi.

Navigasi dan sejumlah integrasi penting sudah diperbaiki. **Aplikasi belum boleh dinyatakan bebas bug atau siap produksi secara menyeluruh.** Pemeriksaan render menu berbeda dari pengujian semua transaksi, otorisasi, penyimpanan, dan integrasi eksternal.

Tidak ada script migrasi manual, penghapusan, atau transaksi bisnis uji yang dijalankan pada database produksi. Pengujian mutasi jurnal memakai database SQLite baru di direktori sementara. Pemanggilan bootstrap schema dari reader voting juga dihapus agar pembukaan halaman tidak mencoba DDL.

## Perbaikan yang diterapkan

### Navigasi dan pengalaman pengguna

- Sidebar, pencarian, dan lokasi halaman memakai satu konfigurasi: `src/lib/navigation.ts`.
- Menu pengurus dikelompokkan; di HP sidebar menjadi drawer. Menu aktif, keyboard, Escape, pengembalian fokus, dan safe area tersedia.
- Pencarian rumah mengambil data server dan mengarahkan hasil ke filter rumah yang benar, bukan data contoh.
- Tab pada 14 modul pengurus dan halaman kuitansi memakai URL tervalidasi serta mendukung Back/Forward. Tab portal warga juga memiliki tautan langsung.
- Tautan yang tidak ada, `/admin/rekap-iuran`, diperbaiki menjadi `/rekap-iuran`.
- Akun warga memiliki tujuan utama `/admin/passwords`. Tautan pengaturan akun lama diarahkan ke sana.
- Kasbon memiliki tujuan utama `/admin/staff-loans`. Akses dari tab pengeluaran diarahkan ke modul yang sama.
- Notifikasi menjadi daftar pekerjaan aktual; audit tetap menjadi riwayat aktivitas, bukan dua halaman dengan konsep identik.
- Login warga disatukan, label form diperbaiki, zoom HP diizinkan, fokus keyboard terlihat, dan motion menghormati preferensi pengguna.
- Script pembersihan otomatis localStorage di layout/login dihapus agar data browser tidak dibuang saat membuka halaman.
- Tab darurat keamanan dibuat responsif; kontak pribadi/daerah contoh yang tidak terverifikasi dihapus dari daftar cepat.

### Data dan respons aksi

- Respons HTTP gagal tidak lagi diabaikan pada aksi yang diperbaiki. Pesan error tampil, dan aksi berhenti sebelum menampilkan sukses.
- Portal warga mengambil tagihan, kendaraan, penghuni, aduan, fasilitas, dan profil yang terkait rumah dari server. Contoh keluarga, kendaraan, tagihan lunas, dan riwayat pembayaran bawaan di portal dihapus.
- Konfirmasi pembayaran memakai ID invoice/periode sebenarnya, sisa tagihan, dan referensi transfer. Area unggah yang sebelumnya tidak bekerja diganti dengan input referensi yang benar-benar dikirim. Penyimpanan berkas bukti tetap memerlukan implementasi terpisah.
- Kuitansi publik memeriksa nomor kuitansi/referensi lengkap terhadap pembayaran berstatus `VERIFIED`; bukan lagi mencari dalam array kosong. Riwayat pribadi diarahkan ke iuran portal warga.
- Identitas pemohon, nomor HP lengkap, dan bukti transfer tidak diberikan oleh API validasi publik.
- Filter periode pada `getPayments()` diperbaiki; nilai pembayaran tidak diganti nominal contoh.
- Dokumen mengambil metadata database dan membuka tautan berkas sebenarnya. Unduhan TXT yang diberi label PDF dan pemilih berkas palsu dihapus. Saat ini fitur publikasi berupa tautan HTTPS, bukan penyimpanan file upload.
- Pendaftaran hunian dan permohonan salinan kuitansi menjadi tinjauan/salin permohonan; tidak lagi mengaku terkirim/terverifikasi melalui timer tanpa backend.
- Ekspor diberi label snapshot operasional dengan batas baris; tidak mengaku sebagai backup lengkap atau restore otomatis.
- Booking memakai ID fasilitas sebenarnya dan menolak waktu selesai sebelum mulai. Reservasi dimuat pengurus dari server, status disimpan, dan reservasi dipisahkan dari daftar maintenance.

### Integritas jurnal dan rekening

- Jurnal manual kini disimpan bersama perubahan saldo dalam transaksi database, bukan hanya audit log.
- Perubahan nominal, arah, atau rekening membalik kontribusi lama dan menerapkan kontribusi baru secara atomik.
- Transfer antar-rekening memakai satu API dan satu transaksi: kedua jurnal mempunyai ID transfer yang sama.
- Rekening tidak ditemukan, rekening sama, nominal tidak valid, dan saldo transfer tidak cukup ditolak.
- Pembatalan transfer menghapus pasangan jurnal sekaligus dan membalik kedua saldo. UI menjelaskan dampaknya sebelum konfirmasi.
- Jurnal yang berasal dari pembayaran/pengeluaran tidak bisa diubah lewat editor jurnal manual, agar sumber transaksi tidak terputus.
- Rekening baru/perubahan metadata rekening disimpan di server. Saldo awal rekening baru dicatat sebagai jurnal pembukaan.
- Saldo dari cache browser tidak lagi mengalahkan saldo rekening server pada modul buku kas.
- Mengedit rekening bank biasa tidak lagi menimpa seluruh profil komunitas atau seluruh rekening bank.

### Keamanan yang diperbaiki, belum menyeluruh

- Login membuat sesi server; logout membatalkannya.
- Middleware sekarang melindungi seluruh halaman pengurus, portal warga, dan API privat dengan sesi server serta matriks peran. Endpoint yang tidak dikenal ditolak secara default. Endpoint publik hanya health, login/logout, profil komunitas, dan validasi kuitansi.
- Sesi mempunyai batas maksimum tujuh hari dari waktu login. Akun, peran, status aktif, keterhubungan rumah, dan versi kredensial diperiksa ulang pada permintaan privat. Reset password membatalkan sesi lama; perubahan peran dan penonaktifan akun langsung berlaku.
- Semua selector rumah pada perubahan profil diperiksa; ID dan kode yang bertentangan ditolak. Endpoint memperbarui satu ID rumah yang benar-benar ada, tanpa default A-17 atau kondisi UPDATE yang dapat menyasar dua rumah.
- Dashboard petugas tidak lagi mengirim daftar pembayaran privat melalui props SSR. Daftar notifikasi mengikuti akses menu akun.
- Cookie identitas JSON lama dihapus saat login. Rute `/portal` mengarah ke `/warga` dan mempertahankan query tab, sehingga tidak lagi membaca identitas dari cookie tersebut.
- Kata sandi baru disimpan sebagai hash scrypt. Password demo tidak menjadi jalan pintas autentikasi; petunjuk demo pada login pengurus dihapus. Spasi dalam password dipertahankan.
- Reset akun mencatat identitas pelaku dari sesi, bukan `actorName` kiriman browser. Reset kavling dibatasi ke akun warga, tidak mencakup super admin/pengurus.
- Permintaan mutasi dari origin lain ditolak, dan percobaan login dibatasi di proses Node.
- Pengajuan aduan sekarang memakai service penyimpanan, termasuk SQLite lokal, dan muncul kembali saat overview dibaca ulang. Kegagalan Neon tidak dialihkan menjadi sukses lokal.
- Cookie JSON/localStorage tidak menjadi sumber otorisasi untuk endpoint tersebut.
- Kredensial koneksi yang ditanam langsung di kode dan `.env.example` dihapus. `.env` pengguna tidak diubah.
- **Kredensial lama harus dirotasi oleh pemilik akun**, karena menghapusnya dari kode tidak menghapus riwayat Git atau salinan terdahulu.

## Matriks menu pengurus

“Render diperiksa” berarti halaman/tab bisa dibuka; bukan berarti seluruh operasi bisnis sudah diuji end-to-end.

| Menu | Submenu/tab utama | Hasil dan batasan |
|---|---|---|
| Ringkasan | Tampilan peran, kas, iuran, tindak lanjut | UI lebih ringkas; data utama dari service. Beberapa panel peran masih perlu audit data operasional lanjutan. |
| Rumah & warga | Unit, penghuni, kendaraan, izin, utilitas | Navigasi/filter diperiksa. Endpoint submodul tertentu masih hanya membuat record respons/audit; lihat P1. |
| Akun warga | Daftar akun, reset, kirim rincian | Tujuan utama disatukan. Uji reset sebenarnya belum dijalankan terhadap akun produksi. |
| Tagihan | Invoice, matriks, tarif, batch | URL tab dan respons aksi diperbaiki. Generasi batch perlu uji staging untuk duplikasi/idempotensi. |
| Pembayaran | Verifikasi, histori, loket, kanal | Error API tidak diabaikan; filter periode diperbaiki. Verifikasi/pembatalan kas perlu uji end-to-end staging. |
| Pengeluaran | Transaksi, rutin, santunan, pemeliharaan | Tab/label diringkas; kasbon diarahkan ke modul utama. Subfitur lokal belum seluruhnya konsisten dengan database. |
| Kasbon | Aktif, permohonan, potongan, histori, kebijakan | Navigasi URL/error diperbaiki. Persistensi dan saldo cicilan harus diuji staging. |
| Buku kas | Jurnal, rekening, rekonsiliasi, laporan | Jurnal/rekening/transfer diperbaiki; tes integritas transaksi lulus pada SQLite sementara. Rekonsiliasi eksternal belum teruji. |
| Anggaran | Matriks, cadangan, publik, input | Navigasi dan tautan publik diperbaiki. Dana cadangan yang disimpan lokal perlu penyatuan server. |
| Laporan & tren | Finansial, kepatuhan, utilitas, keamanan | Tab diperiksa; sumber data setiap grafik belum seluruhnya tervalidasi. |
| Keamanan | Petugas, jadwal, patroli, gerbang, inventaris, darurat | Tab diperiksa. Kontrol gerbang belum dapat dinyatakan terhubung ke perangkat fisik. |
| Kebersihan | Petugas, rute, checklist, alat, tiket | Navigasi/error diperbaiki. Beberapa endpoint/persistensi lokal masih membutuhkan implementasi domain. |
| Fasilitas | Katalog, booking, maintenance, petugas | Booking/status kini terhubung server dan terpisah dari maintenance. Perlu tabel booking khusus dan pengujian bentrok jadwal bersamaan. |
| Aduan | Semua, respons, pengerjaan, selesai | Error perubahan status tidak lagi dianggap sukses. Uji alur warga→petugas→selesai perlu staging. |
| Pengumuman | Pengumuman, agenda, template, audiens | Navigasi/error diperbaiki; agenda/template lokal belum seluruhnya menjadi sumber server tunggal. |
| Musyawarah | Pemilihan, polling, pemilih, aturan | Render/tab diperiksa. Integritas satu suara/pemilih dan otorisasi perlu uji backend terpisah. |
| WhatsApp | Template, simulator, histori, pengaturan | Navigasi diperiksa. Simulator bukan integrasi gateway pengiriman nyata. |
| Notifikasi | Pembayaran, aduan, fasilitas | Mengarah ke pekerjaan aktual; terpisah dari audit. |
| Dokumen | Daftar, kategori, pencarian, tambah tautan | Metadata server dan tautan nyata; upload binary belum tersedia. |
| Riwayat aktivitas | Filter dan detail audit | Render diperiksa; kelengkapan audit seluruh endpoint belum dijamin. |
| Cadangan data | Snapshot, tautan serah terima | Batas ekspor dijelaskan; restore/full backup bukan fitur aktif. |
| Pengaturan | Branding, profil, keuangan, keamanan, kebersihan, notifikasi, pengurus, direktori | Tab disambungkan; akun diarahkan ke halaman utama. Sinkronisasi semua pengaturan lintas perangkat masih perlu audit. |

## Temuan terbuka yang wajib ditindaklanjuti

### P0 — sebelum dipakai sebagai sistem produksi

1. **Audit izin domain masih diperlukan.** Middleware sesi/peran dan batas rumah sudah diterapkan dan diuji. Tetap periksa granularitas izin `user_property_access`, relasi person/household pada endpoint lama, serta matriks aksi setiap peran. Penolakan anonim pada semua API bukan bukti semua aturan bisnis telah benar.
2. **Kredensial yang pernah tertanam perlu dirotasi**, termasuk apabila pernah ada dalam riwayat repositori atau salinan deployment.
3. **Uji transaksi keuangan lain pada staging PostgreSQL**: verifikasi ganda, pembatalan pembayaran, pengeluaran, cicilan, dan generasi iuran. Tes SQLite jurnal tidak membuktikan seluruh transaksi PostgreSQL benar.
4. **Penyimpanan sesi server saat deployment** harus sesuai lingkungan. Adapter Node saat ini menggunakan filesystem; serverless/multi-instance perlu storage sesi bersama. Batas kedaluwarsa tujuh hari sudah diterapkan. Rate limit dalam memori juga perlu storage bersama untuk beberapa instance.

### P1 — fitur yang belum sepenuhnya tersambung

- `src/pages/api/properties/occupants/create.ts` dan endpoint penghapusan penghuni belum memperbarui seluruh relasi person/household secara permanen; data tambahan tidak tersimpan lengkap.
- `src/pages/api/properties/permits/create.ts` membuat respons/audit, tetapi `getInitialPermits()` masih mengembalikan array kosong. Perlu penyimpanan izin dan alur persetujuan permanen.
- Metadata spesifikasi/utilitas rumah belum seluruhnya dipersistenkan; loader utilitas masih mempunyai nilai asumsi.
- Pendaftaran kendaraan melalui endpoint lama belum seluruhnya persisten; pada mode SQLite loader kendaraan belum membaca tabel lokal. Audit RFID juga harus membedakan registrasi kendaraan dari aktivasi perangkat gerbang.
- Sebagian roster/rute/checklist/alokasi cadangan/agenda/inventaris bergantung localStorage. Data antar perangkat belum dijamin sama.
- Booking masih memakai format reservasi historis pada tabel maintenance. Reader sudah dipisah, tetapi migrasi ke tabel booking khusus, deposit, pengaitan rumah, dan penguncian jadwal perlu dirancang.
- Riwayat kuitansi berformat periode-rumah dapat ambigu apabila ada beberapa pembayaran pada periode yang sama. Referensi pembayaran yang unik lebih tepat untuk kasus tersebut.
- Integrasi file upload, WhatsApp gateway, kamera QR nyata, dan perangkat gerbang membutuhkan layanan/perangkat yang sesuai; tidak boleh diganti label sukses simulasi.
- Pembatalan jurnal manual masih menghapus record setelah membalik saldo. Sebelum produksi finansial, ganti dengan reversal yang mempertahankan seluruh riwayat, sesuai `14-AI-CODING-INSTRUCTIONS.md`; tes saldo saat ini tidak membuktikan kepatuhan retensi transaksi.

Data lama di localStorage tidak dihapus. Sebelum migrasi domain, inventarisasi dan ekspor data lokal agar record yang benar-benar dibuat pengguna tidak hilang.

## Pengujian dan cara mengulang

- `npm run build`: lulus pada perubahan kode terakhir sebelum dokumen laporan ini.
- `npm run typecheck`: lulus.
- `npm run audit:navigation`: 211 file sumber, 22 rute pengurus, 82 referensi endpoint API, tidak ditemukan target literal yang hilang. Tidak menguji semua URL dinamis atau payload API.
- `npm run test:ledger`: lulus; menggunakan SQLite sementara. Meliputi persistensi, reversal, transfer atomik, rekening tidak ada, saldo kurang, perlindungan entri terkait, dan penghapusan pasangan.
- `npm run test:authorization`: lulus untuk batas sesi/peran helper baru dan penolakan cookie palsu; bukan audit keamanan seluruh aplikasi.
- `npm run test:access`: lulus untuk peran, batas selector rumah, hash password, kedaluwarsa sesi, dan rate limit login.
- `npm run test:ui`: lulus. Runner membuat database fixture, menjalankan server build pada localhost, memeriksa 75 halaman/tab, kemudian menjalankan suite HTTP. Navigasi utama diuji pada lebar 360, 768, dan 1440 px; seluruh tab diperiksa overflow pada 360 px.
- `npm run test:security`: suite HTTP saja pada fixture baru. Tes memeriksa 92 metode endpoint privat, cookie palsu, akses petugas/bendahara/warga, pembatasan invoice/rumah, origin, privasi SSR, persistensi aduan, jurnal/transfer, audit reset, perubahan peran, penonaktifan akun, dan logout.
- Jalankan build sampai selesai sebelum tes browser/HTTP. Jangan rebuild direktori `dist` selama server tes berjalan.
- Tanpa `UI_TEST_URL`, runner mengaktifkan pemeriksaan seluruh menu secara otomatis. `CHROME_PATH` memilih Chrome/Edge, `UI_TEST_OUTPUT` memilih direktori screenshot, dan `UI_AUDIT_PORT` memilih port server terisolasi. Jika `UI_TEST_URL`, username, serta password diberikan bersama, runner hanya menjalankan navigasi pada server yang ditentukan; suite HTTP mutasi tidak dijalankan di sana.

Tes UI tidak menekan simpan/hapus/reset pada database produksi. Untuk menuntaskan status “semua fitur aktif dan saling terhubung”, jalankan matriks CRUD/otorisasi di database staging terisolasi setelah P0/P1 di atas diselesaikan.

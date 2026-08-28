# 📖 Buku Panduan Operasional & Penggunaan Sistem WargaHub

Selamat datang di **Buku Panduan Operasional WargaHub** — Sistem Manajemen Tata Kelola & Transparansi Keuangan Komplek Perumahan Modern.

---

## 📑 Daftar Isi
1. [Panduan untuk Warga (Portal Warga Mobile)](#1-panduan-untuk-warga-portal-warga-mobile)
2. [Panduan untuk Petugas Keamanan (Pos Satpam & Gate Control)](#2-panduan-untuk-petugas-keamanan-pos-satpam)
3. [Panduan untuk Pengurus Komplek (Ketua RT/RW & Bendahara)](#3-panduan-untuk-pengurus-komplek-ketua--bendahara)
4. [Tanya Jawab & Pemecahan Masalah (FAQ)](#4-tanya-jawab--faq)

---

## 1. Panduan untuk Warga (Portal Warga Mobile)

Akses: `http://localhost:4321/` atau pasang aplikasi melalui tombol **"Install / Tambahkan ke Layar Utama"** di browser HP Anda.

### A. Memeriksa Tagihan & Melakukan Pembayaran Iuran
1. Buka halaman utama Portal Warga.
2. Di kartu **Status Iuran**, periksa status bulan berjalan (*LUNAS* warna hijau, atau *BELUM BAYAR* warna merah).
3. Jika belum bayar, klik tombol **"Bayar Iuran Sekarang"**.
4. Pilih metode pembayaran (*Transfer Bank BCA / QRIS*), lalu salin nomor rekening resmi **8830-1928-33 (a.n PENGURUS KOMPLEK)**.
5. Unggah foto bukti transfer dan klik **"Kirim Konfirmasi Pembayaran"**.

### B. Melihat & Mencetak Kuitansi Digital Resmi
1. Masuk ke Tab **Iuran** di bagian navigasi bawah.
2. Klik tombol **"Lihat / Cetak Kuitansi Resmi"**.
3. Kuitansi berstempel digital *"LUNAS / VERIFIED"* dan QR Code verifikasi akan tampil.
4. Klik tombol **"Cetak Kuitansi Resmi"** untuk menyimpan sebagai file PDF atau langsung mencetak.

### C. Memesan Fasilitas & Sarana Komplek
1. Masuk ke Tab **Info**.
2. Klik tombol **"Pesan Sarana"** di sudut kanan atas.
3. Pilih fasilitas yang ingin dipinjam (*Balai Warga Serbaguna, Lapangan Olahraga, atau Taman Bermain*).
4. Masukkan tanggal pemakaian, jam mulai, jam selesai, keperluan acara, dan nomor WhatsApp.
5. Klik **"Ajukan Sewa"**. Permohonan akan otomatis masuk ke sistem pengurus untuk disetujui.

### D. Mengajukan Keluhan Lingkungan (Aduan)
1. Masuk ke Tab **Info** ➔ Klik tombol **"Aduan"**.
2. Masukkan judul laporan (contoh: *Lampu jalan Blok C mati*), kategori (*Keamanan/Kebersihan/Fasilitas*), dan lokasi spesifik.
3. Klik **"Kirim Laporan Aduan"**. Laporan Anda akan langsung didisposisikan ke satpam/petugas sarana.

### E. Mendaftarkan Kendaraan Keluarga
1. Masuk ke Tab **Rumah** ➔ Klik tombol **"+ Tambah Kendaraan"**.
2. Masukkan plat nomor (*contoh: B 1234 ABC*), jenis (*Mobil/Motor*), merk, model, dan warna kendaraan.
3. Klik **"Simpan Kendaraan"**. Kendaraan Anda otomatis dikenali di pos satpam.

---

## 2. Panduan untuk Petugas Keamanan (Pos Satpam)

Akses: `http://localhost:4321/admin/security-gate`

### A. Memindai QR Pass Warga / Tamu
1. Buka menu **Pos Satpam & Kontrol Gerbang**.
2. Pada tab **Verifikasi QR Pass**, arahkan scanner atau ketikkan kode QR kuitansi warga (*contoh: `INV-202608-A17`*) atau pass tamu (*contoh: `GUEST-B07`*).
3. Klik **"Verifikasi"**. Sistem akan memvalidasi keaslian data dan menampilkan status *"AKSES DIBERIKAN"*.

### B. Memeriksa Plat Nomor Kendaraan
1. Masuk ke tab **Cek Plat Kendaraan Warga**.
2. Ketikkan nomor polisi kendaraan yang melintas di pos gerbang (*contoh: `B 1234 ABC`*).
3. Klik **"Cari Plat"**. Sistem akan menampilkan nama pemilik, unit rumah terdaftar, dan status keabsahan warga.

### C. Mencatat Buku Tamu / Kurir Masuk
1. Masuk ke tab **Buku Tamu Digital**.
2. Masukkan nama tamu/kurir, plat nomor, dan nomor rumah tujuan.
3. Klik **"+ Catat Masuk Gerbang"**.
4. Saat tamu meninggalkan komplek, klik tombol **"Tandai Keluar"**.

---

## 3. Panduan untuk Pengurus Komplek (Ketua & Bendahara)

Akses: `http://localhost:4321/admin`

### A. Melakukan Penagihan Iuran Masal (Billing Engine)
1. Masuk ke menu **Iuran & Billing** (`/admin/billing`).
2. Klik tombol hijau **"Generate Tagihan Bulan Depan (120 Rumah)"**.
3. Sistem akan membuatkan 120 invoice baru secara otomatis di Neon PostgreSQL.
4. Klik tombol **"Bagikan Reminder WA"** di baris rumah yang belum membayar untuk mengirimkan tautan tagihan resmi langsung ke nomor WhatsApp warga yang bersangkutan.

### B. Memverifikasi Pembayaran Warga
1. Masuk ke menu **Pembayaran** (`/admin/payments`).
2. Periksa bukti transfer pembayaran yang diunggah warga.
3. Klik tombol **"Setujui (Verifikasi)"** untuk mengubah status tagihan menjadi Lunas dan menerbitkan kuitansi digital.

### C. Mengelola Buku Kas & Ekspor Laporan
1. Masuk ke menu **Buku Kas & Ledger** (`/admin/ledger`).
2. Gunakan filter *Semua Arus Kas*, *Pemasukan (Debit)*, atau *Pengeluaran (Kredit)*.
3. Klik tombol **"Ekspor Data Kas (CSV)"** untuk mengunduh laporan keuangan ke format spreadsheet Excel.

### D. Mengirim Broadcast Pengumuman Masal
1. Masuk ke menu **Pengumuman** (`/admin/announcements`).
2. Buat pengumuman baru dengan judul, isi pesan, kategori, dan jadwal acara.
3. Klik tombol **"Broadcast ke WhatsApp"** pada kartu pengumuman untuk menyebarkan informasi ke grup WhatsApp warga.

### E. Melakukan Pencadangan & Serah Terima Jabatan
1. Masuk ke menu **Pencadangan & Backup** (`/admin/backup`).
2. Klik tombol **"Unduh Backup Lengkap (.JSON)"** untuk mengunduh seluruh database perumahan (120 rumah, seluruh riwayat transaksi, buku kas, dan log audit).
3. Cetak checklist serah terima kepengurusan saat pergantian periode RT/RW.

---

## 4. Tanya Jawab & FAQ

- **T: Bagaimana cara mengakses aplikasi di jaringan lokal WiFi perumahan?**  
  *J: Buka browser dan ketikkan alamat IP server: `http://192.168.1.34:4321`.*
- **T: Apakah data warga dan laporan kas aman?**  
  *J: Ya, seluruh data tersimpan di Neon PostgreSQL Cloud terenkripsi dengan audit logging aktif yang mencatat setiap aksi perubahan data.*

# 🏡 WargaHub — Sistem Manajemen & Transparansi Komplek Perumahan

**WargaHub** adalah aplikasi modern untuk tata kelola perumahan, transparansi keuangan warga, penagihan iuran masal, pemesanan sarana umum, kontrol gerbang pos satpam, dan repositori dokumen resmi komplek.

---

## 🚀 Fitur Utama

- 📱 **Portal Warga PWA**: Informasi tagihan iuran, cetak kuitansi berstempel digital resmi, sewa fasilitas, aduan, dan registrasi kendaraan keluarga.
- 📊 **Laporan Transparansi Keuangan**: Laporan publik kas bulanan dengan drilldown nota kuitansi per pos biaya dan opsi privasi nomor rumah.
- ⚙️ **Dashboard Pengurus & Billing Masal**: Generator tagihan masal 120 rumah, pengingat WhatsApp otomatis, verifikasi transfer, dan buku kas.
- 🛡️ **Pos Satpam & Kontrol Gerbang**: Pemindai QR Code kuitansi/pass tamu, pencarian plat nomor kendaraan warga, dan buku tamu digital.
- 📈 **Analitik Tren Finansial**: Perbandingan kepatuhan pembayaran antar Blok A, B, C, D dan evaluasi serapan anggaran.
- 💾 **Pencadangan & Serah Terima**: Ekspor basis data JSON lengkap untuk pemulihan bencana dan paket serah terima kepengurusan RT/RW.
- 🩺 **Health Check & Monitoring API**: Endpoint diagnostik real-time memeriksa latensi database Neon PostgreSQL dan memori runtime.

---

## 🛠️ Stack Teknologi

- **Frontend & Fullstack**: [Astro v5 SSR](https://astro.build/) + [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Neon PostgreSQL Cloud](https://neon.tech/) (34 Relational Tables, Connection Pooling)
- **Icons & Styling**: Lucide React + Tabular Fonts
- **PWA & Offline**: Web App Manifest (`manifest.webmanifest`) + Service Worker (`sw.js`)
- **Containerization**: Docker (Multi-stage Alpine) + Docker Compose
- **Process Manager**: Standalone Node.js & PM2 Cluster

---

## ⚡ Cara Menjalankan Aplikasi

### 1. Mode Produksi (Lokal / Server Node.js)
```bash
# Install dependencies
npm install

# Build asset produksi
node ./node_modules/astro/astro.js build

# Jalankan server live production
node prod-server.mjs
```
Akses aplikasi:
- 📱 Portal Warga: `http://localhost:4321/`
- 📊 Transparansi: `http://localhost:4321/transparency`
- ⚙️ Admin Dashboard: `http://localhost:4321/admin`
- 🛡️ Pos Satpam: `http://localhost:4321/admin/security-gate`

### 2. Mode Docker & Docker Compose
```bash
# Jalankan container dalam 1 perintah
docker compose up -d --build
```

### 3. Menjalankan Pengujian Otomatis (*End-to-End Test Suite*)
```bash
node ./node_modules/tsx/dist/cli.mjs scripts/verify-all.ts
```

---

## 📖 Panduan Pengguna Lengkap

Silakan baca berkas [MANUAL_PANDUAN_PENGGUNA.md](file:///c:/Users/P%20R%20E%20D%20A%20T%20O%20R/Documents/wargahub/MANUAL_PANDUAN_PENGGUNA.md) untuk panduan operasional langkah-demi-langkah bagi Warga, Petugas Satpam, dan Pengurus RT/RW.

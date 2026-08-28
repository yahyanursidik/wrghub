# WargaHub / Sistem Tata Kelola Komplek

WargaHub adalah aplikasi web untuk pengelolaan tata kelola komplek/perumahan yang berpusat pada **rumah/unit**, bukan sekadar pada akun warga.

Sistem mencakup:
- data rumah, pemilik, penghuni, dan rumah tangga,
- pengelolaan iuran bulanan,
- pembayaran dan verifikasi,
- penggunaan dana operasional,
- kas dan ledger,
- transparansi publik,
- reminder otomatis,
- portal warga per rumah,
- pengumuman,
- aduan,
- sarana dan maintenance,
- dokumen,
- audit trail,
- notifikasi,
- histori perubahan.

## Stack Utama

- Astro 7
- React
- Refine 5
- Neon PostgreSQL
- Drizzle ORM
- Tailwind CSS
- shadcn/ui / Radix
- Zod
- React Hook Form
- Better Auth atau auth custom
- Netlify
- Resend
- Cloudflare R2 / storage S3 compatible
- Hallmark sebagai design discipline

## Prinsip Arsitektur

```text
Astro 7
├── Public Pages
├── Resident Portal
├── API / Actions
└── /admin
     └── React + Refine 5

Service Layer
↓
Repository Layer
↓
Drizzle ORM
↓
Neon PostgreSQL
```

## Prinsip Domain

Pusat data utama adalah:

```text
Komplek
↓
Blok
↓
Rumah / Unit
↓
Kepemilikan
↓
Hunian
↓
Household
↓
Penghuni
```

Setiap rumah memiliki histori sendiri dan dapat berganti pemilik maupun penghuni tanpa menghapus riwayat lama.

## Dokumen

1. `01-PRODUCT-BRIEF.md`
2. `02-DOMAIN-MODEL.md`
3. `03-DATABASE-SCHEMA.md`
4. `04-ROLES-PERMISSIONS.md`
5. `05-MODULES-FEATURES.md`
6. `06-BILLING-FINANCE.md`
7. `07-PUBLIC-TRANSPARENCY.md`
8. `08-UI-UX-NAVIGATION.md`
9. `09-ARCHITECTURE.md`
10. `10-API-SERVICE-LAYER.md`
11. `11-EVENT-NOTIFICATION.md`
12. `12-AUDIT-SECURITY.md`
13. `13-IMPLEMENTATION-ROADMAP.md`
14. `14-AI-CODING-INSTRUCTIONS.md`
15. `15-ACCEPTANCE-CRITERIA.md`

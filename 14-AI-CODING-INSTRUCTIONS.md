# AI Coding Instructions

## Peran

Anda adalah senior system analyst, software architect, dan full stack engineer.

Bangun sistem berdasarkan seluruh file markdown pada repository.

## Aturan Utama

1. Jangan mengubah domain model tanpa alasan kuat.
2. Jangan membuat feature di luar roadmap aktif.
3. Jangan menaruh business logic di UI.
4. Jangan query database langsung dari React component.
5. Gunakan service dan repository layer.
6. Semua input divalidasi Zod.
7. Semua permission divalidasi di server.
8. Semua transaksi finansial harus auditable.
9. Tidak ada hard-delete transaksi finansial.
10. Semua mutation penting menghasilkan audit log.
11. UI harus mobile-friendly.
12. Hindari AI-slop pada UI.
13. Gunakan naming konsisten.
14. Jangan membuat file besar monolitik.
15. Prioritaskan type safety.

## Coding Style

- TypeScript strict
- functional modules
- explicit return types untuk service penting
- schema-first
- reusable UI primitives
- feature-based folder
- no any tanpa alasan

## Database

Gunakan:
- Neon PostgreSQL
- Drizzle ORM

Buat:
- migrations,
- indexes,
- unique constraints,
- foreign keys.

## Refine

Refine hanya digunakan pada `/admin`.

Jangan paksa resident portal menggunakan Refine jika tidak diperlukan.

## Astro

Astro digunakan sebagai:
- app shell,
- public routing,
- SSR,
- resident portal,
- actions/API.

## Implementation Workflow

Setiap tahap:

1. baca file terkait,
2. buat rencana singkat,
3. implement schema,
4. implement service,
5. implement API/action,
6. implement UI,
7. buat test,
8. jalankan lint/typecheck/test,
9. perbaiki error,
10. dokumentasikan perubahan.

## Hallmark / UI

Hindari:
- gradient dekoratif,
- glassmorphism,
- random icon,
- generic SaaS dashboard,
- terlalu banyak KPI cards.

Utamakan:
- hierarchy,
- whitespace,
- typography,
- status yang jelas,
- actionable dashboard.

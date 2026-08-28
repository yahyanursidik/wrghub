# Application Architecture

## Pembagian Tanggung Jawab

### Astro 7
Digunakan untuk:
- routing utama,
- SSR,
- public pages,
- resident portal,
- API endpoints,
- Astro Actions,
- middleware,
- session.

### React
Digunakan untuk komponen interaktif.

### Refine 5
Digunakan khusus backoffice/admin:
- CRUD,
- resource management,
- data provider,
- auth provider,
- access control,
- query invalidation.

## Struktur

```text
Astro
├── /
├── /login
├── /dashboard
├── /house
├── /billing
├── /info
├── /transparency
└── /admin/*
    └── React Router + Refine
```

## Backend Layering

```text
UI
↓
Action/API
↓
Service
↓
Repository
↓
Drizzle
↓
Neon
```

## Jangan

Jangan:
- query database langsung dari komponen React,
- menyimpan business rule dalam UI,
- memanggil Drizzle dari halaman secara acak,
- mencampur auth dengan business logic.

## Environment

```text
DATABASE_URL=
DATABASE_URL_POOLED=
AUTH_SECRET=
RESEND_API_KEY=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

## Deployment

Target:
- Netlify
- Neon PostgreSQL

Gunakan connection pooling Neon untuk serverless.

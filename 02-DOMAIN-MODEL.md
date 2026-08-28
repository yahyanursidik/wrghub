# Domain Model

## Prinsip Utama

Entitas utama adalah **Property / Rumah / Unit**.

Jangan menggunakan `users.house_id` sebagai relasi utama.

Satu user dapat:
- tinggal di satu rumah,
- memiliki rumah lain,
- mengelola beberapa rumah.

## Struktur

```text
Community
└── Block
    └── Property
        ├── Ownership
        │   └── Person
        ├── Occupancy
        │   └── Household
        │       └── Household Member
        │           └── Person
        ├── Vehicle
        ├── Invoice
        ├── Payment
        ├── Complaint
        └── Activity History
```

## Property

Data:
- id
- code
- block_id
- number
- address
- status
- occupancy_status
- notes
- created_at
- updated_at

Status hunian:

```text
OWNER_OCCUPIED
RENTED
BORROWED
VACANT
RENOVATION
FOR_SALE
OTHER
```

## Person

`Person` adalah manusia nyata.

Contoh:
- pemilik rumah,
- penghuni,
- anak,
- kepala keluarga,
- petugas.

Tidak semua person memiliki akun.

## User

`User` adalah akun autentikasi.

Relasi user dengan properti menggunakan:

```text
user_property_access
```

## Ownership

Menyimpan histori kepemilikan.

Field:
- property_id
- person_id
- started_at
- ended_at
- is_active

## Occupancy

Menyimpan histori penghuni rumah.

Field:
- property_id
- household_id
- type
- started_at
- ended_at
- is_active

## Household

Satu rumah tangga dapat terdiri dari:
- kepala rumah tangga,
- pasangan,
- anak,
- orang tua,
- saudara,
- ART,
- penghuni lainnya.

## Household Member

Relasi:
- household_id
- person_id
- relationship
- started_at
- ended_at
- is_active

## Vehicle

Relasi kendaraan dengan rumah/penghuni.

Data:
- plate_number
- type
- brand
- model
- color
- owner_person_id
- property_id
- is_active

## Prinsip Historis

Data pemilik dan penghuni lama tidak boleh ditimpa.

Gunakan:
- `started_at`
- `ended_at`
- `is_active`

untuk menjaga histori.

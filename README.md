# ⚡ Template Turborepo — Monorepo Full-Stack

Template monorepo full-stack siap pakai: **Next.js 16**, **NestJS 11**, dan **Vite + React** dalam satu workspace pnpm + Turborepo — dengan UI kit bersama, autentikasi JWT terpusat, database Prisma (SQLite & PostgreSQL), dan 129 test otomatis.

![pnpm](https://img.shields.io/badge/pnpm-10.33-F69220?logo=pnpm&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-2.9-EF4444?logo=turborepo&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)

---

## ⚡ Langkah Setup Awal

### Prasyarat

- **Node.js ≥ 20** (direkomendasikan 22+)
- **pnpm 10** — aktifkan dengan `corepack enable` (versi terpin otomatis sesuai `packageManager` di `package.json`)

### Clone & setup

```bash
git clone https://github.com/heinricov/template-turborepo.git
cd template-turborepo-01

corepack enable     # pnpm 10.33.4 (jika pnpm belum terpasang)
pnpm bootstrap      # siapkan .env (JWT_SECRET acak, DATABASE_URL_PGSQL kosong),
                    # install deps, generate & buat tabel database — aman diulang
pnpm dev            # jalankan semua aplikasi
```

| App   | URL                                     |
| ----- | --------------------------------------- |
| web   | http://localhost:3000                   |
| admin | http://localhost:3001                   |
| api   | http://localhost:4000 (health: `GET /`) |

### Opsional

```bash
pnpm sqlite seed User   # isi akun contoh: admin / admin@admin.com / admin1234 · user / user@user.com / user1234
pnpm test               # jalankan semua test (UI + security)
```

### PostgreSQL (mis. Prisma Postgres di Vercel)

Isi `DATABASE_URL_PGSQL` di `packages/db/.env` (atau `POSTGRES_URL` / `PRISMA_DATABASE_URL` di env deploy), lalu:

```bash
pnpm --filter @workspace/db db:generate:pgsql && pnpm --filter @workspace/db db:push:pgsql
```

API otomatis beralih ke PostgreSQL saat salah satu env di atas terisi — lokal tetap SQLite. Jangan menimpa `DATABASE_URL` (khusus SQLite).

---

## 📖 Dokumentasi Lengkap

Untuk **penggunaan penuh dan setup detail** (arsitektur, tech stack, struktur repo, aplikasi & endpoint, packages, testing, semua script, environment variables, CLI data, git workflow) baca:

> 📄 **[`Readme/use.md`](Readme/use.md) — Panduan Lengkap Penggunaan & Setup**

| Dokumen                                       | Isi                                                              |
| --------------------------------------------- | ---------------------------------------------------------------- |
| [**use.md**](Readme/use.md)                   | **Panduan lengkap penggunaan & setup** (titik awal yang tepat)   |
| [**architecture.md**](Readme/architecture.md) | Arsitektur, alur data & autentikasi, konvensi workspace          |
| [**api.md**](Readme/api.md)                   | Referensi API lengkap: endpoint, request/response, contoh `curl` |
| [**components.md**](Readme/components.md)     | Katalog komponen UI kit + cara memakainya                        |
| [**development.md**](Readme/development.md)   | Panduan pengembangan: script per app, database, menambah package |
| [**testing.md**](Readme/testing.md)           | Strategi testing & catatan penting tiap suite                    |

---

## 🧑‍💻 Catatan

- **Keamanan (template)**: untuk proyek production, ganti penyimpanan token `localStorage` pada `web`/`admin` dengan cookie `httpOnly` + refresh token, dan gunakan secret yang dirotasi.
- **Next.js versi khusus**: repo ini memakai Next.js 16 dengan API yang dapat berbeda dari versi lain — baca panduan di `node_modules/next/dist/docs/` sebelum mengubah kode.

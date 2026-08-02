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

### 1. Clone repository

```bash
git clone https://github.com/heinricov/template-turborepo.git
```

> **Ganti nama proyek?** Folder hasil clone bisa langsung diberi nama sendiri:
>
> ```bash
> git clone https://github.com/heinricov/template-turborepo.git nama-proyek-anda
> ```
>
> Untuk mengubah nama paket di `package.json` dan referensi di dokumentasi, setelah clone jalankan:
>
> ```bash
> pnpm rename nama-proyek-anda
> ```

### 2. Masuk ke direktori proyek

```bash
cd nama-proyek-anda
```

### 3. Aktifkan pnpm (jika belum terpasang)

```bash
corepack enable
```

### 4. Jalankan setup otomatis

```bash
pnpm bootstrap
```

`pnpm bootstrap` melakukan semuanya sekaligus (aman dijalankan ulang):

1. **Bersihkan dokumen template** — menghapus folder `Readme/` internal, menulis `README.md` versi ringkas ini, dan mengosongkan tabel `commit.md`.
2. **Environment files** — membuat `apps/api/.env` (dengan `JWT_SECRET` acak) dan `packages/db/.env` (dengan `DATABASE_URL_PGSQL` kosong). File yang sudah ada tidak ditimpa.
3. **Install dependencies** — `pnpm install` (reproducible via `pnpm-lock.yaml`).
4. **Generate Prisma Client & build** — `db:generate` (SQLite) + `db:generate:pgsql` (PostgreSQL), lalu build `@workspace/db` (menghasilkan `dist/` yang dipakai aplikasi & CLI).
5. **Setup database SQLite** — `db:push` (membuat `packages/db/prisma/dev.db`).

> Output setiap langkah diringkas. Log lengkap disimpan di `/tmp/bootstrap-*`; bila ada yang gagal, 20 baris terakhir log otomatis ditampilkan.

### 5. Jalankan semua aplikasi

```bash
pnpm dev
```

| App   | URL                                     |
| ----- | --------------------------------------- |
| web   | http://localhost:3000                   |
| admin | http://localhost:3001                   |
| api   | http://localhost:4000 (health: `GET /`) |

### Opsional

```bash
pnpm sqlite seed User   # isi akun contoh: admin / admin@admin.com / admin1234 · user / user@user.com / user1234
pnpm test               # pilih unitest / security / all — lalu pilih folder & file
pnpm test unitest ui    # langsung: folder ui tanpa menu
pnpm test security unit # langsung: folder unit (security)
```

### PostgreSQL (mis. Prisma Postgres di Vercel)

Isi `DATABASE_URL_PGSQL` di `packages/db/.env` (atau `POSTGRES_URL` / `PRISMA_DATABASE_URL` di env deploy), lalu:

```bash
pnpm --filter @workspace/db db:generate:pgsql && pnpm --filter @workspace/db db:push:pgsql
```

API otomatis beralih ke PostgreSQL saat salah satu env di atas terisi — lokal tetap SQLite. Jangan menimpa `DATABASE_URL` (khusus SQLite).

---

## 🧰 Perintah Berdasarkan Peruntukan

Semua script disimpan di `scripts/` sesuai peruntukannya: **`workspace-clone/`** (setup & tooling pasca-clone), **`workspace-db/`** (urusan database), dan **`workspace-test/`** (menjalankan test).

### 🚀 Setup & Clone — `scripts/workspace-clone/`

| Perintah             | Fungsi                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `corepack enable`    | Aktifkan pnpm dengan versi terpin (`packageManager` di `package.json`)                                                                 |
| `pnpm bootstrap`     | Setup otomatis pasca-clone: hapus `Readme/`, tulis README ringkas, buat env, install deps, generate Prisma, setup SQLite. Aman diulang |
| `pnpm rename <nama>` | Ganti nama paket di `package.json` + referensi `cd` di dokumentasi (mis. `pnpm rename my-app`)                                         |

### 🗄️ Database — `scripts/workspace-db/`

| Perintah                                        | Fungsi                                                     |
| ----------------------------------------------- | ---------------------------------------------------------- |
| `pnpm sqlite <sub>`                             | CLI data langsung ke SQLite lokal (`dev.db`)               |
| `pnpm pgsql <sub>`                              | CLI data langsung ke PostgreSQL (env `DATABASE_URL_PGSQL`) |
| `pnpm --filter @workspace/db db:generate`       | Generate Prisma Client                                     |
| `pnpm --filter @workspace/db db:push`           | Buat/sinkronkan skema ke SQLite                            |
| `pnpm --filter @workspace/db db:generate:pgsql` | Generate Prisma Client (PostgreSQL)                        |
| `pnpm --filter @workspace/db db:push:pgsql`     | Sinkronkan skema ke PostgreSQL                             |

Sub-perintah CLI data (sama untuk `sqlite` dan `pgsql`; `pnpm sqlite` di bawah → `pnpm pgsql` untuk PostgreSQL):

| Perintah                               | Fungsi                                             |
| -------------------------------------- | -------------------------------------------------- |
| `pnpm sqlite tables`                   | Daftar semua tabel                                 |
| `pnpm sqlite seed User`                | Seed akun contoh (admin / user)                    |
| `pnpm sqlite push table users key=val` | Insert/update baris langsung (sesuai model Prisma) |
| `pnpm sqlite delete table users`       | Hapus data tabel                                   |

### 📦 Menjalankan & Development

| Perintah             | Fungsi                                                 |
| -------------------- | ------------------------------------------------------ |
| `pnpm dev`           | Jalankan semua app (web 3000 · admin 3001 · api 4000)  |
| `pnpm build`         | Build semua package                                    |
| `pnpm lint`          | Lint semua package                                     |
| `pnpm typecheck`     | TypeScript typecheck                                   |
| `pnpm format`        | Format kode dengan Prettier                            |
| `pnpm test`          | Menu pilihan: unitest / security / all (folder & file) |
| `pnpm test:ui`       | Test UI saja (Vitest — 102 test)                       |
| `pnpm test:security` | Test security JWT saja (37 test)                       |
| `pnpm unitest create`| Generator unit test utk `@workspace/shadcn` (menu folder & file) |

### 🔄 Git & GitHub — `scripts/github/`

| Perintah    | Fungsi                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm push` | Satu perintah `git add .` → commit → push — mencatat commit ke tabel `commit.md` (type: add/fix/update) |

# 🛠️ Panduan Pengembangan

Setup, alur kerja harian, cara menambah app/package, dan konvensi konfigurasi di monorepo ini.

---

## ✅ Prasyarat

| Tool    | Versi                   | Cek       |
| ------- | ----------------------- | --------- |
| Node.js | ≥ 20                    | `node -v` |
| pnpm    | 10.x (lockfile 10.33.4) | `pnpm -v` |

Aktifkan pnpm via corepack (opsional):

```bash
corepack enable
corepack prepare pnpm@10.33.4 --activate
```

---

## 📦 Install & Setup Awal

```bash
pnpm install                        # install semua workspace

cp apps/api/.env.example apps/api/.env   # JWT_SECRET (wajib)
# DATABASE_URL opsional — default file:./dev.db di packages/db

pnpm --filter @workspace/db db:generate   # Prisma Client
pnpm --filter @workspace/db db:push       # buat tabel SQLite
pnpm dev                                  # web:3000 · admin:3001 · api:4000
```

`pnpm install` menuntaskan _postinstall_ untuk `@prisma/engines`, `better-sqlite3`, `esbuild`, `prisma` (daftar `onlyBuiltDependencies` di root `package.json`).

---

## 🚀 Perintah Per App

| Perintah  | `web` (Next.js)                              | `admin` (Vite)                                    | `api` (NestJS)                                 |
| --------- | -------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| dev       | `pnpm --filter web dev` (`next dev -p 3000`) | `pnpm --filter admin dev` (`vite`)                | `pnpm --filter api dev` (`nest start --watch`) |
| build     | `pnpm --filter web build` (`next build`)     | `pnpm --filter admin build` (`tsc && vite build`) | `pnpm --filter api build` (`nest build`)       |
| start     | `pnpm --filter web start`                    | `pnpm --filter admin preview`                     | —                                              |
| lint      | `pnpm --filter web lint`                     | `pnpm --filter admin lint`                        | `pnpm --filter api lint`                       |
| typecheck | `pnpm --filter web typecheck`                | `pnpm --filter admin typecheck`                   | `pnpm --filter api typecheck`                  |

Contoh pola umum untuk package lain (`pnpm --filter <nama> <script>`), atau sekaligus dari root dengan Turbo: `pnpm lint` / `pnpm typecheck` / `pnpm build`.

---

## 🧱 Menambah App Baru

Contoh menambah `apps/blog`:

1. **Buat folder** `apps/blog/` dengan `package.json` (nama tanpa scope, mis. `"blog"`).
2. **Jangan edit `pnpm-workspace.yaml`** — glob `apps/*` sudah mencakupnya. Jalankan `pnpm install`.
3. **tsconfig** — extends preset yang cocok dari `@workspace/config`:
   ```json
   { "extends": "@workspace/config/typescript/nextjs.json" }
   ```
4. **ESLint** — buat `eslint.config.mjs` yang mengimport preset dari `@workspace/config` (lihat contoh di app lain).
5. **Scripts** — tambahkan `dev`, `build`, `lint`, `typecheck` (opsional `format`) agar pipeline Turbo jalan.
6. **Register task** di `turbo.json` bila butuh env khusus (contoh task `web` dengan `env: ["API_URL"]`).
7. **Verifikasi** — `pnpm typecheck && pnpm lint && pnpm build`.

> Bila app baru adalah aplikasi web React, tambahkan juga `@workspace/shadcn` sebagai dependency dan set alias `@workspace/shadcn/*` di tsconfig + bundler (lihat cara `apps/admin`).

---

## 📦 Menambah Package Baru

1. Buat folder `packages/<nama>` dengan `package.json` ber-nama `@workspace/<nama>` (private, `"private": true`).
2. **Exports map** — selalu arahkan `types` ke **source TS** (`./src/index.ts`) dan `default` ke hasil build (`./dist/index.js`):
   ```json
   {
     "exports": {
       ".": { "types": "./src/index.ts", "default": "./dist/index.js" }
     }
   }
   ```
3. tsconfig extends `nest.json` (bila berisi dekorator NestJS) / `react-library.json` (bila berisi React) / `base.json` (murni TS); script `build: tsc`.
4. ESLint sesuai isi package (`eslint/nest` untuk codebase NestJS, dst.).
5. Import dari app lain: `import { x } from "@workspace/nama"`.
6. Tambahkan test bila package berisi logika penting (lihat [testing.md](testing.md)).

---

## ⚙️ Konfigurasi Bersama (`@workspace/config`)

### Preset ESLint (`config/eslint/`)

| Preset           | Isi (di atas base)                                                                                                                   | Dipakai oleh                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `base`           | `js.configs.recommended` + `typescript-eslint` recommended + `eslint-config-prettier`, plugin `turbo` (env vars) & `only-warn`       | `audit/security`                  |
| `nest`           | base + `@typescript-eslint/no-extraneous-class: off`                                                                                 | `api`, `auth`, `db`, `validation` |
| `next-js`        | base + `eslint-plugin-react` + `@next/eslint-plugin-next` (recommended + core-web-vitals) + `react-hooks`, `react-in-jsx-scope: off` | `web`                             |
| `react-internal` | base + `eslint-plugin-react` + `react-hooks` (dengan globals browser/serviceworker)                                                  | `shadcn`, `admin`, `audit-vitest` |

### Preset TypeScript (`config/typescript/`)

| Preset          | Kunci compilerOptions                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`          | `strict`, `module/moduleResolution: NodeNext`, `esModuleInterop`, `isolatedModules`, `lib: es2022+DOM`, `noUncheckedIndexedAccess`, `skipLibCheck` |
| `nest`          | base + `module: node16`, `experimentalDecorators`, `emitDecoratorMetadata`, `sourceMap`, `incremental`                                             |
| `nextjs`        | base + `module: ESNext`, `moduleResolution: Bundler`, `jsx: preserve`, `noEmit`, plugin `next`                                                     |
| `react-library` | base + `jsx: react-jsx`                                                                                                                            |
| `vite-react`    | base + `module: ESNext`, `moduleResolution: Bundler`, `jsx: react-jsx`, `noEmit`                                                                   |

---

## 💾 Alur Kerja Database

```bash
pnpm --filter @workspace/db db:generate   # regenerasi Prisma Client setelah ubah schema
pnpm --filter @workspace/db db:push       # sinkronkan schema → SQLite (tanpa migrasi file)
pnpm --filter @workspace/db db:studio     # Prisma Studio (GUI browser)
```

- Schema: `packages/db/prisma/schema.prisma` (satu model `User`, tabel `"Users"`).
- `prisma.config.ts` membaca `DATABASE_URL` dari env.
- File `dev.db` dibuat otomatis saat `db:push` pertama; jangan di-commit (`.gitignore`).

---

## 🎨 Gaya Kode

### Prettier (`.prettierrc`)

```jsonc
{
  "semi": false, // tanpa titik koma
  "singleQuote": false, // double quote
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cn", "cva"],
}
```

Jalankan di seluruh repo: `pnpm format`. Diabaikan: `dist/`, `.next/`, `.turbo/`, `coverage/`, `pnpm-lock.yaml`.

### VS Code (`.vscode/settings.json`)

- Format on save via `esbenp.prettier-vscode` (ts/tsx/js/jsx/json/jsonc)
- `source.fixAll.eslint` on save (explicit)
- `prettier.requireConfig: true` — hanya format jika ada config

### Konvensi penting

- **Bahasa Indonesia** untuk string yang tampil ke user (error API, label form, validasi).
- Komponen UI: ikuti pola Base UI + `cn()` + `data-slot` (lihat `packages/shadcn/src/ui/`).
- Jangan import file lintas app — pindahkan logika bersama ke `packages/*`.
- Jangan commit `.env*`, `*.db`, `dist/`, `.next/`.

---

## ⚠️ Catatan Khusus Next.js 16

Repositori ini memakai **Next.js 16.2.6** — versi dengan perubahan API/konvensi yang mungkin berbeda dari versi lain (mis. konfigurasi, App Router, rendering). Sebelum menulis kode Next.js:

1. Baca panduan terkait di `node_modules/next/dist/docs/`.
2. Perhatikan _deprecation notices_ — API lama bisa sudah dihapus.
3. Referensi contoh yang sudah berjalan di repo ini: `apps/web/app/layout.tsx`, `next.config.ts` (rewrites + `transpilePackages`).

---

## 🔧 Troubleshooting

| Masalah                                       | Solusi                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `JWT_SECRET` missing saat `pnpm dev`          | Salin `apps/api/.env.example` → `apps/api/.env`, isi secret acak                                 |
| Error Prisma "generate belum dijalankan"      | `pnpm --filter @workspace/db db:generate`                                                        |
| Tabel tidak ada / query gagal                 | `pnpm --filter @workspace/db db:push`                                                            |
| Import `@workspace/shadcn` tidak ter-resolve  | Pastikan tsconfig app mengextend preset react (nextjs/vite-react/react-library) yang punya alias |
| Test integrasi gagal "API dev tidak tersedia" | Jalankan `pnpm dev` dulu (lihat [testing.md](testing.md))                                        |
| Perubahan env tidak terdeteksi Turbo          | Restart dev; env sudah terdaftar di `globalEnv`/task `web`                                       |

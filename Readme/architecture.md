# 🧱 Arsitektur

Dokumen ini menjelaskan arsitektur monorepo secara mendalam: struktur workspace, alur data antar aplikasi, alur autentikasi JWT, ketergantungan antar package, dan konvensi yang dipakai.

---

## 📐 Gambaran Umum

Monorepo ini mengelola **3 aplikasi** dan **4 package library** (+ 1 package konfigurasi + 2 package testing) dalam satu workspace pnpm dengan Turborepo sebagai orchestrator pipeline.

```
┌───────────────────────────── WORKSPACE ─────────────────────────────┐
│                                                                      │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────────────────┐  │
│  │ apps/web  │  │ apps/admin│  │           apps/api               │  │
│  │ Next.js16 │  │ Vite + RR7│  │         NestJS 11                │  │
│  │  :3000    │  │  :3001    │  │           :4000                  │  │
│  └─────┬─────┘  └─────┬─────┘  │  ┌───────────────────────────┐   │  │
│        │              │        │  │ AuthModule · UserModule    │   │  │
│        │ /api rewrite │ /api   │  │ JwtGuard (global)          │   │  │
│        └──────┬───────┘ proxy  │  │ ZodValidationPipe          │   │  │
│               │                │  └────────────┬──────────────┘   │  │
│               └──────────┐     │               │                  │  │
│                          ▼     │               ▼                  │  │
│   @workspace/shadcn ◀────┘  │  │   ┌─────────────────────────┐   │  │
│   (UI kit, komponen)        │  │   │ @workspace/auth (JWT)   │   │  │
│   @workspace/validation ◀───┘  │   │ @workspace/validation    │   │  │
│   (schema form Zod)           │  │   │ @workspace/db (Prisma) │   │  │
│                              │  │   └────────────┬────────────┘   │  │
│                              │  │                ▼                │  │
│                              │  │   ┌───────────────────────┐     │  │
│                              │  │   │  SQLite (dev.db)      │     │  │
│                              │  │   └───────────────────────┘     │  │
└──────────────────────────────┴──┴─────────────────────────────────┘  │
```

---

## 🔀 Alur Data

### 1. Dari browser ke API

Frontend (`web` dan `admin`) **tidak** memanggil `localhost:4000` langsung dari browser, melainkan lewat proxy agar bebas CORS dan mudah dikonfigurasi:

| App     | Mekanisme                                                                | Konfigurasi                 |
| ------- | ------------------------------------------------------------------------ | --------------------------- |
| `web`   | **Rewrite Next.js** — `/api/:path*` → `${API_URL}/:path*`                | `apps/web/next.config.ts`   |
| `admin` | **Proxy Vite** — `/api` → `http://localhost:4000` (path `/api` di-strip) | `apps/admin/vite.config.ts` |

Contoh: `web` memanggil `POST /api/auth/login` → Next me-rewrite menjadi `POST http://localhost:4000/auth/login`.

> Khusus halaman `web/` (server component), fetch dilakukan **langsung** ke `${API_URL}/users` di sisi server dengan `cache: "no-store"` — lihat `apps/web/app/page.tsx:15`.

### 2. Di dalam API

1. Request masuk ke controller NestJS (`AuthController`, `UserController`).
2. Body divalidasi `ZodValidationPipe` dengan schema dari `@workspace/validation` — jika gagal, `400 BadRequestException` berisi pesan per field.
3. `JwtGuard` (global) memeriksa token kecuali route ditandai `@Public()`.
4. Service berkomunikasi dengan database via `PrismaService` (`@workspace/db/client`).
5. Password di-hash/dibandingkan dengan `bcryptjs` (cost 10).

---

## 🔐 Alur Autentikasi JWT

### Komponen (di `packages/auth`)

| Komponen         | Peran                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `JwtModule`      | Modul NestJS `@Global()` — menyediakan opsi JWT via `register()` (nilai statis) atau `registerAsync()` (`useFactory` + `inject`)                    |
| `JwtService`     | `sign(payload, expiresIn?)` → token; `verify<T>(token)` → payload. Default `expiresIn: "1d"`                                                        |
| `JwtGuard`       | Guard global — bypass jika ada metadata `@Public()`, mengekstrak header `Authorization: Bearer <token>`, memverifikasi, lalu men-set `request.user` |
| `@Public()`      | Menandai handler/class agar dilewati guard (`SetMetadata(PUBLIC_KEY, true)`)                                                                        |
| `@CurrentUser()` | Parameter decorator — mengambil `request.user` (payload JWT) di handler                                                                             |

### Registrasi di `apps/api`

```ts
// apps/api/src/app.module.ts
JwtModule.register({ secret: process.env.JWT_SECRET, expiresIn: "1d" }),
{ provide: APP_GUARD, useClass: JwtGuard },
```

Jika `JWT_SECRET` tidak tersedia, aplikasi menolak untuk start (gagal cepat, bukan gagal diam-diam).

### Skema token

Payload JWT terdiri dari:

```ts
{
  sub: string,    // id user
  email: string,
  role: string    // "user" | "admin"
}
```

Siklus hidup:

1. `POST /auth/login` → `bcrypt.compare` → `JwtService.sign()` → `{ token, user }`.
2. Request terproteksi → client kirim `Authorization: Bearer <token>`.
3. `JwtGuard.canActivate()`:
   - ada metadata `@Public`? → **lolos** tanpa token;
   - tidak ada header `Authorization`/bukan `Bearer` → `401 UnauthorizedException("Token tidak ditemukan")`;
   - token invalid/kedaluwarsa/di-tamper → `401 UnauthorizedException("Token tidak valid atau kedaluwarsa")`;
   - berhasil → `request.user = payload`, lanjut ke handler.

### Pembagian akses per endpoint

| Endpoint                                                          | Akses          |
| ----------------------------------------------------------------- | -------------- |
| `POST /auth/login`, `POST /users`, `GET /users`, `GET /users/:id` | 🟢 `@Public()` |
| `PATCH /users/:id`, `DELETE /users/:id`, `GET /`                  | 🔒 JWT wajib   |

---

## 🧩 Ketergantungan Antar Package

```
apps/web ────► @workspace/shadcn
apps/admin ──► @workspace/shadcn
apps/api ────► @workspace/auth · @workspace/db · @workspace/validation

@workspace/auth ──────► @nestjs/common, @nestjs/core (peer), jsonwebtoken
@workspace/db ────────► @prisma/client, @prisma/adapter-better-sqlite3, better-sqlite3
@workspace/validation ► zod

audit/vitest ────► @workspace/shadcn, vitest, jsdom, @testing-library/*
audit/security ──► @workspace/auth, @nestjs/common, vitest

semua workspace ────► @workspace/config (eslint + tsconfig, devDependency)
```

Aturan Turborepo (`turbo.json`):

| Task                            | Perilaku                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `build`                         | `dependsOn: ^build` — package dependencies dibuild dulu; output `.next/**` & `dist/**` di-cache |
| `lint` / `typecheck` / `format` | `dependsOn: ^*` — dependensi diproses lebih dulu                                                |
| `test`                          | `cache: false` — selalu dijalankan ulang; `dependsOn: ^build`                                   |
| `dev`                           | `persistent: true` — proses berjalan terus (tidak di-cache)                                     |
| `web`                           | `env: [API_URL]` — task khusus untuk env `web`                                                  |

`globalEnv` Turbo: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`.

---

## ⚙️ Konfigurasi Bersama (`@workspace/config`)

Semua workspace memakai preset yang sama melalui `@workspace/config`:

| Workspace                                                         | tsconfig                                            | ESLint                  |
| ----------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| `apps/api`, `packages/auth`, `packages/db`, `packages/validation` | `typescript/nest.json`                              | `eslint/nest`           |
| `apps/web`                                                        | `typescript/nextjs.json`                            | `eslint/next-js`        |
| `apps/admin`                                                      | `typescript/vite-react.json`                        | `eslint/react-internal` |
| `packages/shadcn`, `audit/vitest`                                 | `typescript/react-library.json`                     | `eslint/react-internal` |
| `audit/security`                                                  | `typescript/base.json` (+ `experimentalDecorators`) | `eslint/base`           |

Rincian isi tiap preset ada di **[`development.md`](development.md)**.

---

## 💾 Database

- **Provider**: SQLite via driver adapter `@prisma/adapter-better-sqlite3` (tanpa server database).
- **Schema**: `packages/db/prisma/schema.prisma` — satu model `User` (tabel `"Users"`).

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String?
  password  String   @default(uuid())
  status    String   @default("register")
  role      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- **Client**: singleton global (`globalThis.prisma`) saat `NODE_ENV !== "production"` — `packages/db/src/client.ts`.
- **Koneksi**: `process.env.DATABASE_URL ?? "file:<pkg>/dev.db"` — `packages/db/.env` berisi `DATABASE_URL="file:./dev.db"`.
- **Siklus**: `db:generate` (build client) → `db:push` (sinkronisasi schema) → `db:studio` (browser UI).

---

## 📁 Struktur Lengkap

```
apps/
├── api/
│   └── src/
│       ├── main.ts                 # bootstrap, listen :4000
│       ├── app.module.ts           # JwtModule + JwtGuard global
│       ├── app.controller.ts       # GET / (health, butuh JWT)
│       ├── app.service.ts
│       ├── prisma.service.ts       # wrapper @workspace/db/client
│       ├── load-env.ts             # dotenv (.env)
│       ├── common/zod.pipe.ts      # ZodValidationPipe
│       ├── auth/                   # AuthModule: POST /auth/login
│       └── user/                   # UserModule: CRUD /users
├── admin/
│   └── src/
│       ├── main.tsx                # BrowserRouter + StrictMode
│       ├── App.tsx                 # rute + guard auth + LayoutSide
│       ├── lib/api.ts              # authFetch (inject token dari localStorage)
│       └── pages/                  # login, dashboard, users/* (index, register, profile, detail)
└── web/
    ├── app/
    │   ├── layout.tsx              # font, ThemeProvider, WarpLayout
    │   ├── page.tsx                # / — DataTable user (server component)
    │   ├── auth/login/             # /auth/login (komponen Login)
    │   ├── auth/signup/            # /auth/signup (komponen Signup)
    │   └── profile/                # /profile (mock)
    ├── components/                 # warp-layout, hero-section, navigations/, profile/
    └── lib/auth.ts                 # localStorage session (web.auth.session)

packages/
├── auth/src/        # jwt.module, jwt.service, jwt.guard, jwt.decorators, jwt.constants, jwt.types
├── db/              # src/client.ts, src/index.ts, prisma/schema.prisma, prisma.config.ts
├── shadcn/src/
│   ├── styles/      # globals.css (Tailwind v4 + tw-animate-css + shadcn)
│   ├── ui/          # 30 komponen Base UI (button … theme-provider)
│   ├── components/  # auth/ (login, signup) · data-form/ · data-table/ · sidebar/
│   ├── hooks/       # use-mobile.ts
│   └── lib/         # utils.ts (cn) · api.ts (apiFetch)
└── validation/src/  # user.ts (schema Zod) · index.ts

audit/
├── vitest/          # setup.ts (polyfill jsdom) + 28 file test (src/lib, src/ui)
└── security/        # unit/ (jwt.service, jwt.guard, jwt.decorators) + integration/ (dev-server)

config/
├── eslint/          # base.js · nest.js · next.js · react-internal.js
└── typescript/      # base.json · nest.json · nextjs.json · react-library.json · vite-react.json
```

---

## 📌 Konvensi Workspace

1. **Nama package** semua berawalan `@workspace/` (kecuali app yang tanpa scope: `web`, `admin`, `api`).
2. **Exports map** library menunjuk **source TypeScript** untuk tipe (`types`) dan `dist/` untuk runtime:
   ```json
   {
     "exports": {
       ".": { "types": "./src/index.ts", "default": "./dist/index.js" }
     }
   }
   ```
3. **Dekorator & metadata NestJS** hanya dipakai di package yang mengextend `nest.json` (butuh `experimentalDecorators`).
4. **Message string** (error API, label form, pesan validasi) menggunakan **Bahasa Indonesia**.
5. Setiap package punya script konsisten: `build` (opsional), `lint`, `typecheck`, `format`.
6. `.env*` tidak di-commit; template ada di `*.env.example`; `turbo.json` mendeklarasikan `globalEnv`.

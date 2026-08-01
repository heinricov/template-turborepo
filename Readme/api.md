# 🖥️ Referensi API

Dokumen ini menjelaskan seluruh endpoint REST API `apps/api` (NestJS 11, port **4000**), format request/response, aturan validasi, dan contoh `curl`.

---

## 📡 Daftar Endpoint

| #   | Metode   | Path          | Proteksi  | Deskripsi                               |
| --- | -------- | ------------- | --------- | --------------------------------------- |
| 1   | `GET`    | `/`           | 🔒 JWT    | Health check + jumlah user              |
| 2   | `POST`   | `/auth/login` | 🟢 Publik | Login, balas `{ token, user }`          |
| 3   | `POST`   | `/users`      | 🟢 Publik | Registrasi user baru (password di-hash) |
| 4   | `GET`    | `/users`      | 🟢 Publik | Daftar semua user                       |
| 5   | `GET`    | `/users/:id`  | 🟢 Publik | Detail satu user                        |
| 6   | `PATCH`  | `/users/:id`  | 🔒 JWT    | Update profil user                      |
| 7   | `DELETE` | `/users/:id`  | 🔒 JWT    | Hapus user                              |

> Semua body request harus `application/json` dengan header `Content-Type: application/json`.

---

## 🔐 Autentikasi

Endpoint terproteksi membutuhkan header:

```
Authorization: Bearer <token>
```

Token diperoleh dari `POST /auth/login`. Guard global (`JwtGuard`) memverifikasi token dengan `JWT_SECRET`; payload token berisi `{ sub, email, role }` dan berlaku **1 hari** (default `expiresIn`).

Respon error autentikasi (status `401`):

| Skenario                                             | Message                              |
| ---------------------------------------------------- | ------------------------------------ |
| Header `Authorization` hilang / skema bukan `Bearer` | `Token tidak ditemukan`              |
| Token invalid, tampered, atau kedaluwarsa            | `Token tidak valid atau kedaluwarsa` |
| Email atau password salah saat login                 | `Email atau password salah`          |

---

## ✅ Aturan Validasi (Zod)

Schema hidup di `@workspace/validation` dan dipakai API via `ZodValidationPipe`. Pesan error digabung menjadi satu string: `field1: pesan1, field2: pesan2` dengan status `400`.

### `POST /users` — `registerSchema`

| Field      | Aturan                                                                  |
| ---------- | ----------------------------------------------------------------------- |
| `email`    | Wajib, format email valid (`Email tidak valid`)                         |
| `username` | Opsional, 3–50 karakter                                                 |
| `password` | Wajib, minimal 8 karakter, maksimal 100 (`Password minimal 8 karakter`) |
| `role`     | Wajib, hanya `"user"` atau `"admin"` (`Role harus user atau admin`)     |

### `POST /auth/login` — `loginSchema`

| Field      | Aturan                                             |
| ---------- | -------------------------------------------------- |
| `email`    | Wajib, format email valid                          |
| `password` | Wajib, minimal 1 karakter (`Password wajib diisi`) |

### `PATCH /users/:id` — `updateProfileSchema`

Semua field opsional (hanya field yang dikirim yang di-update):

| Field      | Aturan                                    |
| ---------- | ----------------------------------------- |
| `username` | 3–50 karakter bila diisi                  |
| `password` | 8–100 karakter bila diisi (di-hash ulang) |
| `status`   | Minimal 1 karakter                        |
| `role`     | `"user"` atau `"admin"`                   |

---

## 📖 Detail Endpoint

### 1. `GET /` — Health check 🔒

```bash
curl http://localhost:4000/ \
  -H "Authorization: Bearer <token>"
```

**Respon `200`:**

```text
Hello from API! Users in DB: 3
```

(Plain string — health check sederhana dari `AppService`.)

---

### 2. `POST /auth/login` — Login 🟢

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "rahasia123"}'
```

**Respon `201`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "cm8q...",
    "email": "user@example.com",
    "username": "user",
    "status": "register",
    "role": "user",
    "createdAt": "2026-08-01T07:00:00.000Z",
    "updatedAt": "2026-08-01T07:00:00.000Z"
  }
}
```

**Error:**

| Status | Skenario                                  |
| ------ | ----------------------------------------- |
| `400`  | Email/password tidak valid (validasi Zod) |
| `401`  | `Email atau password salah`               |

---

### 3. `POST /users` — Registrasi 🟢

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "baru@example.com", "username": "baru", "password": "rahasia123", "role": "user"}'
```

**Respon `201`:** user yang dibuat (tanpa kata sandi, `password` tidak dikembalikan).

**Error:**

| Status | Skenario                                                                                     |
| ------ | -------------------------------------------------------------------------------------------- |
| `400`  | Validasi gagal — contoh: `email: Email tidak valid, password: Password minimal 8 karakter`   |
| `409`  | Email sudah terdaftar (`email sudah digunakan` — `PrismaUniqueConstraint` ditangkap service) |

---

### 4. `GET /users` — Daftar user 🟢

```bash
curl http://localhost:4000/users
```

**Respon `200`:** array seluruh user.

> Endpoint ini dipakai halaman `web/` (server component) dan dashboard `admin`.

---

### 5. `GET /users/:id` — Detail user 🟢

```bash
curl http://localhost:4000/users/cm8q...
```

**Respon `200`:** satu objek user. `404` jika id tidak ditemukan.

---

### 6. `PATCH /users/:id` — Update user 🔒

```bash
curl -X PATCH http://localhost:4000/users/cm8q... \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username": "nama-baru", "role": "admin"}'
```

**Respon `200`:** user terbaru. Jika `password` dikirim, akan di-hash ulang (`bcrypt`, cost 10).

**Error:** `400` (validasi), `401` (token), `404` (user tidak ada).

---

### 7. `DELETE /users/:id` — Hapus user 🔒

```bash
curl -X DELETE http://localhost:4000/users/cm8q... \
  -H "Authorization: Bearer <token>"
```

**Respon `200`:** objek user yang dihapus `{ id, email, username, role }` (bukan string).

**Error:** `401` (token), `404` (user tidak ada).

---

## ⚠️ Format Error Umum

| Status | Arti                       | Body                                                                                                                          |
| ------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `400`  | Validasi Zod gagal         | `{ "message": "email: Email tidak valid, password: Password minimal 8 karakter", "error": "Bad Request", "statusCode": 400 }` |
| `401`  | Token/email-password salah | `{ "message": "Token tidak valid atau kedaluwarsa", "error": "Unauthorized", "statusCode": 401 }`                             |
| `404`  | Resource tidak ditemukan   | `{ "message": "...", "error": "Not Found", "statusCode": 404 }`                                                               |
| `409`  | Email duplikat             | `{ "message": "...", "error": "Conflict", "statusCode": 409 }`                                                                |

Format ini adalah struktur standar NestJS (`HttpException`).

---

## 🧪 Verifikasi Cepat (smoke test)

```bash
# 1. Registrasi user uji
curl -X POST http://localhost:4000/users -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"rahasia123","role":"user"}'

# 2. Login → ambil token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"rahasia123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

# 3. Panggil endpoint terproteksi
curl http://localhost:4000/ -H "Authorization: Bearer $TOKEN"
```

> Suite integrasi otomatis untuk seluruh endpoint di atas ada di `audit/security/src/integration/dev-server.test.ts` — lihat [testing.md](testing.md).

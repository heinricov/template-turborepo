# 🧪 Strategi Testing

Monorepo ini punya **129 test otomatis** dalam 2 package audit terpisah di bawah `audit/`.

| Package                     | Lingkungan              | Cakupan                       | Jumlah                               |
| --------------------------- | ----------------------- | ----------------------------- | ------------------------------------ |
| `@workspace/audit-vitest`   | jsdom + Testing Library | UI `@workspace/shadcn` + lib  | **92 test / 28 file**                |
| `@workspace/audit-security` | Node                    | Unit JWT + integrasi live API | **37 test** (21 unit + 16 integrasi) |

---

## ▶️ Menjalankan Test

```bash
pnpm test               # interaktif: tanya unitest / security / all
pnpm test:ui            # hanya UI (filter @workspace/audit-vitest)
pnpm test:security      # hanya security

# Watch mode (per package)
pnpm --filter @workspace/audit-vitest test:watch
pnpm --filter @workspace/audit-security test:watch

# Satu file saja
pnpm --filter @workspace/audit-vitest exec vitest run src/ui/button.test.tsx
```

> Task `test` di `turbo.json` ber-cache `false` — selalu dijalankan ulang, dan `dependsOn: ^build` (package yang dibutuhkan dibuild dulu).

---

## 🧪 `audit-vitest` — Test UI (92 test)

Menguji komponen `@workspace/shadcn` di **jsdom** dengan **Vitest + Testing Library** (react, jest-dom, user-event).

### Struktur

```
audit/vitest/
├── vitest.config.ts     # environment: jsdom, setupFiles: ./setup.ts
├── setup.ts             # polyfill & matchers global
└── src/
    ├── lib/
    │   ├── api.test.ts       # 8 test — apiFetch (header, token, error, fallback)
    │   └── utils.test.ts     # 6 test — cn() (merge, konflik twMerge, dsb.)
    └── ui/                   # 26 file — satu per komponen
        ├── button.test.tsx   # render, data-slot, onClick, disabled, varian
        ├── dialog.test.tsx   # buka/tutup, role, tombol close
        ├── select.test.tsx   # open, pilih opsi, defaultValue
        ├── sidebar.test.tsx  # provider, error tanpa provider, toggle
        ├── theme-provider.test.tsx  # hotkey D, double-press, tidak saat mengetik
        └── … (avatar, breadcrumb, calendar, checkbox, collapsible, dropdown-menu,
             field, input, input-group, label, navigation-menu, popover, scroll-area,
             separator, sheet, skeleton, table, tabs, textarea, tooltip)
```

### `setup.ts` — polyfill yang penting

- `@testing-library/jest-dom/vitest` (matchers `toBeInTheDocument`, `toBeVisible`, …)
- `cleanup()` otomatis antar test
- **`matchMedia` selalu di-override** — jsdom punya implementasi sendiri yang rusak untuk `use-mobile` (stub MediaQueryList)
- `ResizeObserver`, `IntersectionObserver`, `requestAnimationFrame`, `PointerEvent`
- `scrollIntoView`, `hasPointerCapture`/`setPointerCapture`/`releasePointerCapture`, `getAnimations`, `getBoundingClientRect`

### Quirks yang perlu diketahui

- **Base UI memanggil callback dengan 2 argumen** (`value`, `eventDetails`) — gunakan `onX.mock.calls[0]?.[0]`, bukan `toHaveBeenCalledWith(value)`.
- **`data-checked`** adalah _attribute presence_ (`""`), bukan `"true"`.
- **`DialogContent`** secara default menampilkan 2 tombol "Close" — jangan pakai `showCloseButton={false}` (itu menambah tombol lain).
- **Element reference stale** setelah re-render — re-query ulang (mis. via `data-day` untuk Calendar).
- **`next-themes` menyimpan state di `localStorage`** — panggil `localStorage.clear()` di `beforeEach` agar test hotkey tidak saling mencemari.

---

## 🛡️ `audit-security` — Test Keamanan (37 test)

### 1. Unit JWT (21 test) — `src/unit/`

Lingkungan **Node** (tanpa browser), memakai package asli `@workspace/auth`:

| File                     | Jumlah | Yang diuji                                                                                                                            |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `jwt.service.test.ts`    | 8      | struktur token 3 segmen, round-trip payload, klaim `exp` (default & eksplisit), tolak token expired/tampered/secret-salah/bukan token |
| `jwt.guard.test.ts`      | 8      | bypass `@Public` (handler & class), tanpa header, skema non-Bearer, token invalid/tampered/expired, `request.user` terisi             |
| `jwt.decorators.test.ts` | 5      | metadata `@Public`, `@CurrentUser` mendaftarkan param factory yang membaca `request.user`                                             |

Catatan implementasi:

- `createParamDecorator` Nest 11 adalah murni dekorator — panggil langsung `CurrentUser()(Controller.prototype, "method", 0)`, lalu baca `Reflect.getMetadata(ROUTE_ARGS_METADATA, Controller, "method")`.
- Token "palsu" dibuat dengan **base64url** manual (jangan `atob` — hasilnya random padding).
- Token expired diuji dengan `JwtService.sign(payload, "1s")` + jeda, atau membaca `JWT_SECRET` asli dari `apps/api/.env` lalu sign `expiresIn: "1s"` via service.
- `@nestjs/common/constants` di-require via `createRequire` (subpath tidak tersedia untuk TypeScript).

### 2. Integrasi live (16 test) — `src/integration/dev-server.test.ts`

Menguji API nyata di `http://localhost:4000` (dari `process.env.API_URL ?? "http://localhost:4000"`):

- **Kontrol akses** — `GET /users` publik; `PATCH`/`DELETE` tanpa token → 401; skema non-Bearer → 401
- **Serangan token** — token acak, payload di-tamper, token expired → 401
- **Validasi input** — password pendek, email invalid, role tak dikenal → 400
- **Siklus hidup** — register 201 → duplicate 409 → login salah 401 → login sukses 201 + token → `PATCH` terproteksi 200 → `DELETE` 200

**Syarat & perilaku penting:**

> ⚠️ Suite ini **membutuhkan server dev berjalan**: jalankan `pnpm dev` (atau `pnpm --filter api dev`) di terminal lain sebelum `pnpm test:security`.

- Jika server mati, `beforeAll` melempar **error yang jelas** — _"API dev tidak tersedia di http://localhost:4000. Jalankan \"pnpm dev\" terlebih dahulu"_ — **tidak** di-skip diam-diam (keputusan desain: kegagalan harus terlihat).
- Membaca `JWT_SECRET` asli dari `apps/api/.env` untuk membuat token expired yang valid-signed.
- `afterAll` membersihkan user yang dibuat test (best-effort `DELETE`).
- `testTimeout: 15000` (test expired-token butuh menunggu 1 detik).

---

## ✅ Alur Verifikasi Lengkap (sebelum commit)

```bash
pnpm typecheck     # tsc semua workspace
pnpm lint          # eslint semua workspace
pnpm build         # build (cache turbo)
pnpm test          # 129 test

# Jika mengubah sesuatu yang menyentuh API:
pnpm dev &         # jalankan server di background
sleep 12
pnpm test:security
kill %1
```

---

## 💡 Menambah Test Baru

1. **UI** — salin pola file test dari `audit/vitest/src/ui/<komponen>.test.tsx`; nama file `*.test.tsx`; gunakan `userEvent.setup()` untuk interaksi; selalu `getByRole` bila memungkinkan (aksesibilitas).
2. **Security unit** — salin pola `audit/security/src/unit/*.test.ts`; jangan import `jsonwebtoken` langsung (bukan dependency package) — pakai `JwtService`/payload base64url.
3. **Integrasi** — tambahkan kasus di `dev-server.test.ts` dalam `describe` yang sudah ada; pastikan idempotent (cleanup via `afterAll`).
4. Verifikasi: `pnpm typecheck && pnpm lint` lalu jalankan suite terkait.

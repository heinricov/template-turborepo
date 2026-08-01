# 🎨 Katalog Komponen `@workspace/shadcn`

Package `@workspace/shadcn` adalah **UI kit bersama** untuk `web` dan `admin`, dibangun di atas **Base UI** (`@base-ui/react` 1.6) + **Tailwind CSS v4** + **shadcn** (style `base-mira`). Semua komponen di-export dari **source TypeScript** (tanpa build) — app memakainya langsung via exports map package.

```bash
# Import komponen UI
import { Button } from "@workspace/shadcn/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@workspace/shadcn/ui/dialog"

# Komponen kompleks
import { Login } from "@workspace/shadcn/components/auth/login"
import DataForm from "@workspace/shadcn/components/data-form"
import DataTable from "@workspace/shadcn/components/data-table"
import LayoutSide from "@workspace/shadcn/components/sidebar/layout-side"

# Lib & hooks
import { cn } from "@workspace/shadcn/lib/utils"
import { apiFetch } from "@workspace/shadcn/lib/api"
import { useIsMobile } from "@workspace/shadcn/hooks/use-mobile"

# Style (di root layout)
import "@workspace/shadcn/globals.css"
```

---

## 🧩 Komponen UI (30 file di `src/ui/`)

| File                  | Komponen yang diexport                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button.tsx`          | `Button`, `buttonVariants` — varian default/outline/secondary/ghost/destructive/link; ukuran default/xs/sm/lg/icon                                    |
| `input.tsx`           | `Input`                                                                                                                                               |
| `textarea.tsx`        | `Textarea`                                                                                                                                            |
| `label.tsx`           | `Label`                                                                                                                                               |
| `checkbox.tsx`        | `Checkbox`                                                                                                                                            |
| `separator.tsx`       | `Separator`                                                                                                                                           |
| `select.tsx`          | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectGroup`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUp/DownButton` |
| `dropdown-menu.tsx`   | `DropdownMenu*` lengkap (Trigger, Content, Item, CheckboxItem, RadioGroup/Item, Sub, Label, Separator, Shortcut, …)                                   |
| `tabs.tsx`            | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsListVariants`                                                                                  |
| `dialog.tsx`          | `Dialog*` (Root, Trigger, Portal, Overlay, Content, Title, Description, Close, Header, Footer)                                                        |
| `alert-dialog.tsx`    | `AlertDialog*` lengkap (Action, Cancel, Media, …)                                                                                                     |
| `sheet.tsx`           | `Sheet*` (varian kiri/kanan/atas/bawah)                                                                                                               |
| `popover.tsx`         | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`                                                  |
| `tooltip.tsx`         | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`                                                                                      |
| `collapsible.tsx`     | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`                                                                                             |
| `navigation-menu.tsx` | `NavigationMenu*` lengkap + `navigationMenuTriggerStyle`                                                                                              |
| `avatar.tsx`          | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`, `AvatarGroupCount`, `AvatarBadge`                                                           |
| `breadcrumb.tsx`      | `Breadcrumb*` lengkap                                                                                                                                 |
| `calendar.tsx`        | `Calendar`, `CalendarDayButton` — wrapper `react-day-picker` v10                                                                                      |
| `table.tsx`           | `Table*` (Header, Body, Footer, Row, Cell, Caption, …)                                                                                                |
| `sidebar.tsx`         | `Sidebar*` + `SidebarProvider`, `SidebarTrigger`, `useSidebar` (729 baris — menu utama admin)                                                         |
| `scroll-area.tsx`     | `ScrollArea`, `ScrollBar`                                                                                                                             |
| `skeleton.tsx`        | `Skeleton`                                                                                                                                            |
| `field.tsx`           | `Field*` (Label, Description, Error, Group, Legend, Separator, Set, Content, Title)                                                                   |
| `input-group.tsx`     | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`                                        |
| `theme-provider.tsx`  | `ThemeProvider` (next-themes, `attribute="class"`, `defaultTheme="system"`) + hotkey **`D`** untuk toggle dark/light                                  |

---

## 🧱 Komponen Kompleks

### Autentikasi (`components/auth/`)

| Komponen | Props                                                                                   | Keterangan                                                                                              |
| -------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `Login`  | `{ logo?, title?, description?, submitLabel?, onLogin(data: LoginData) }`               | Form login dengan validasi Zod (email + password ≥ 8), memanggil `onLogin` dengan `{ email, password }` |
| `Signup` | `{ logo?, title?, description?, submitLabel?, loginHref?, onSignup(data: SignupData) }` | Form registrasi `{ username, email, password }` + konfirmasi password                                   |

Dipakai di `web/auth/login`, `web/auth/signup`, dan `admin/pages/login`.

### DataForm (`components/data-form/`)

Form dinamis berbasis deklarasi field:

```tsx
import DataForm, { type DataFormField } from "@workspace/shadcn/components/data-form"

const fields: DataFormField[] = [
  { name: "email", label: "Email", type: "email", required: true },
  { name: "username", label: "Username", type: "text" },
  { name: "role", label: "Role", type: "select", options: [{ label: "User", value: "user" }, { label: "Admin", value: "admin" }] },
]

<DataForm fields={fields} onSubmit={handleSubmit} submitLabel="Simpan" />
```

- `type`: `text | email | password | number | textarea | select | date`
- Layout: `layoutCol` (1–4 kolom), `widthForm` (`sm`–`5xl`); tombol cancel opsional
- Schema Zod dibuat otomatis per field; validasi client-side sebelum `onSubmit`

Komponen input individual juga diexport: `InputText`, `InputEmail`, `InputPassword` (dengan toggle tampil/sembunyi), `InputNumber`, `InputTextarea`, `InputSelect`, `InputDate`.

### DataTable (`components/data-table/`)

Tabel data berbasis **TanStack Table**:

```tsx
import DataTable, { type SimpleColumn } from "@workspace/shadcn/components/data-table"

const columns: SimpleColumn<User>[] = [
  { key: "email", header: "Email", type: "email", headerAction: "filter" },
  { key: "role", header: "Role", type: "text" },
  { key: "createdAt", header: "Dibuat", type: "datetime" },
]

<DataTable data={users} columns={columns} rowPagination={10}
  onView={openDetail} onEdit={openEdit} onDelete={deleteUser} />
```

- **Jenis kolom**: `text | number | currencyIDR | currencyUSD | email | datetime | date | time`
- **Fitur**: sorting, filter (per kolom / global), pagination (`5/10/15/20`), kolom visibility, row selection, bulk action bar (Delete / Export Excel)
- **Kolom khusus**: `selectColumn()` (checkbox), `actionsColumn(onView?, onEdit?, onDelete?)` (dropdown View/Edit/Delete)
- Menerima `ColumnDef<TData>` TanStack langsung untuk kolom custom

### Sidebar (`components/sidebar/`)

Kerangka layout panel admin:

```tsx
import LayoutSide from "@workspace/shadcn/components/sidebar/layout-side"

<LayoutSide
  brand={{ name: "Admin Panel", description: "Kelola data" }}
  menu={{ NavMain: { items: [{ title: "Dashboard", url: "/dashboard", icon: HomeIcon }] }, NavCollaps: { … } }}
  user={{ name: "Admin", email: "admin@example.com" }}
  breadcrumb={[{ label: "Dashboard" }]}
  onLogout={handleLogout}
>
  <Outlet />
</LayoutSide>
```

Sub-komponen: `AppSidebar`, `SidebarBrand`, `NavMain` (menu flat), `NavCollaps` (menu dengan sub-item), `NavUser` (profil + menu dropdown), `HeaderSide`, `BreadcrumbSide`.

---

## 🪝 Hooks & Lib

| File                  | Export                        | Keterangan                                                                                                           |
| --------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `hooks/use-mobile.ts` | `useIsMobile()`               | Deteksi breakpoint mobile (`max-width: 767px`)                                                                       |
| `lib/utils.ts`        | `cn(...inputs)`               | `clsx` + `tailwind-merge` — gabungkan class dengan resolusi konflik                                                  |
| `lib/api.ts`          | `apiFetch<T>(path, options?)` | Fetch wrapper: set `Content-Type`, opsi `token` → `Authorization: Bearer`, lempar `Error(message)` dari body backend |

`apiFetch` dipakai `admin` (via `authFetch` yang meng-inject token dari `localStorage`) dan halaman client `web`.

---

## 🌗 Theme

`ThemeProvider` (berbasis `next-themes`) dipasang di root layout `web` dan `admin`:

- `attribute="class"` — tema disimpan sebagai class `dark` di `<html>`
- `defaultTheme="system"` — mengikuti preferensi OS
- **Hotkey `D`** — toggle gelap/terang (nonaktif saat sedang mengetik di input)

Palet warna (oklch) didefinisikan di `styles/globals.css` (`:root` terang + `.dark`), termasuk token khusus `--sidebar-*` dan `--chart-*`.

---

## ➕ Menambah Komponen UI Baru

### Via shadcn CLI (dari registry)

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Komponen baru akan ditaruh di `packages/shadcn/src/ui/`. Setelah ditambah:

1. **Buka package** — pastikan komponen memakai Base UI/Tailwind yang sudah ada (tidak menambah dependency baru tanpa diskusi).
2. **Cek exports** — wildcard `./ui/*` di `package.json` sudah mencakup file baru otomatis.
3. **Ikuti konvensi** — deklarasi `data-slot`, kelas Tailwind sesuai komponen lain, `cn()` untuk gabungan class.
4. **Tambah test** — buat `audit/vitest/src/ui/<nama>.test.tsx` mengikuti pola file test lain (lihat [testing.md](testing.md)).

### Menulis komponen manual

Ikuti pola komponen Base UI di `src/ui/` — gunakan `@base-ui/react/<subpath>` (bukan package root), style dengan `cn()` + Tailwind, dan `forwardRef` bila memakai `render` prop pattern.

---

## 📌 Aturan Pemakaian

1. **Jangan** import langsung dari `../../packages/shadcn/src/...` di dalam app — selalu via alias `@workspace/shadcn/*` (sudah dikonfigurasi di tsconfig & bundler).
2. Komponen yang butuh konteks (Dialog, Popover, Tooltip, Sidebar) memakai `Portal` — test di jsdom memerlukan polyfill tertentu (lihat [testing.md](testing.md)).
3. `packages/shadcn` **tidak memiliki script `build`** — source langsung di-export; app harus mengextend `react-library.json`/`vite-react.json`/`nextjs.json` agar TypeScript me-resolve dengan benar.

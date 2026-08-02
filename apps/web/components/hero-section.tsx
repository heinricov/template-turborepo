import {
  ChevronRight,
  ExternalLink,
  GitBranch,
  ListOrdered,
  Terminal,
} from "lucide-react"

import { Button } from "@workspace/shadcn/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/shadcn/ui/table"

const GITHUB_URL = "https://github.com/heinricov/template-turborepo/tree/main"

const setupSteps = [
  {
    command: "git clone https://github.com/heinricov/template-turborepo.git",
    note: "Clone repository ke direktori lokal",
  },
  {
    command: "corepack enable",
    note: "Aktifkan pnpm 10.33.4 — versi terpin otomatis dari packageManager",
  },
  {
    command: "pnpm bootstrap",
    note: "Siapkan .env (JWT_SECRET acak, DATABASE_URL_PGSQL kosong), install deps, generate & buat tabel database — aman diulang",
  },
  {
    command: "pnpm dev",
    note: "Jalankan semua aplikasi: web :3000 · admin :3001 · api :4000",
  },
]

const commands = [
  {
    command: "pnpm bootstrap",
    description: "Setup awal pasca-clone (env, install, database) — idempotent",
  },
  {
    command: "pnpm dev",
    description:
      "Jalankan semua aplikasi sekaligus (web 3000, admin 3001, api 4000)",
  },
  {
    command: "pnpm build",
    description: "Build semua workspace (dengan cache Turbo)",
  },
  { command: "pnpm lint", description: "ESLint semua workspace" },
  { command: "pnpm typecheck", description: "tsc --noEmit semua workspace" },
  { command: "pnpm format", description: "Prettier — tulis ulang semua file" },
  {
    command: "pnpm test",
    description: "Menu: unitest / security / all — pilih folder & file",
  },
  {
    command: "pnpm test unitest ui",
    description: "Langsung: semua test di folder ui (tanpa menu)",
  },
  {
    command: "pnpm test:ui",
    description: "Hanya test @workspace/audit-vitest",
  },
  {
    command: "pnpm test:security",
    description: "Hanya test @workspace/audit-security",
  },
  {
    command: "pnpm sqlite seed User",
    description: "Isi akun contoh admin & user (password di-hash bcrypt)",
  },
  { command: "pnpm sqlite tables", description: "Daftar tabel di SQLite" },
  {
    command: "pnpm sqlite push table users",
    description: "Input data ke tabel User (interaktif atau key=value)",
  },
  {
    command: "pnpm pgsql push table users",
    description: "Input data ke PostgreSQL (perlu DATABASE_URL_PGSQL)",
  },
  {
    command: "pnpm push",
    description: "git add → commit → push dalam satu perintah",
  },
]

export default function HeroSection() {
  return (
    <section className="bg-background text-foreground flex w-full items-center justify-center px-6 py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="group border-border bg-muted/40 text-foreground hover:bg-muted inline-flex items-center gap-2 border py-1 pr-2 pl-2.5 text-xs font-medium transition-colors"
        >
          <GitBranch className="text-foreground size-3.5" aria-hidden="true" />
          <span>github.com/heinricov/template-turborepo</span>
          <ExternalLink
            className="text-muted-foreground size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Template Turborepo — Monorepo Full-Stack
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl text-base text-pretty">
          Next.js 16, NestJS 11, dan Vite + React dalam satu workspace pnpm +
          Turborepo — dengan UI kit bersama, autentikasi JWT terpusat, database
          Prisma (SQLite & PostgreSQL), dan 129 test otomatis.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
            nativeButton={false}
            variant="outline"
            size="lg"
          >
            <GitBranch data-icon="inline-start" aria-hidden="true" />
            Lihat di GitHub
          </Button>
          <Button
            render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
            nativeButton={false}
            size="lg"
          >
            Clone template
            <ChevronRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>

        <div className="border-border bg-muted/20 mt-14 w-full max-w-3xl rounded-lg border p-6 text-left">
          <div className="flex items-center gap-2">
            <Terminal className="size-4" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Setup dalam 4 langkah</h2>
          </div>
          <ol className="mt-4 space-y-3">
            {setupSteps.map((step, index) => (
              <li
                key={step.command}
                className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
              >
                <code className="bg-muted text-foreground inline-block rounded-md px-2.5 py-1.5 font-mono text-xs whitespace-nowrap">
                  {index + 1}. {step.command}
                </code>
                <span className="text-muted-foreground text-xs">
                  {step.note}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 w-full max-w-3xl text-left">
          <div className="flex items-center gap-2">
            <ListOrdered className="size-4" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Perintah pnpm</h2>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Daftar perintah yang tersedia dan fungsinya.
          </p>
          <div className="border-border mt-4 overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Perintah</TableHead>
                  <TableHead>Fungsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commands.map(({ command, description }) => (
                  <TableRow key={command}>
                    <TableCell className="text-foreground font-mono">
                      {command}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-normal">
                      {description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  )
}

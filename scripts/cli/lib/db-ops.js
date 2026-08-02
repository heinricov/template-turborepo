import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import chalk from "chalk"
import { ROOT, clackSelect, clackText } from "./ui.js"

const DB_DIR = path.join(ROOT, "packages", "db")
const dbRequire = createRequire(path.join(DB_DIR, "package.json"))

const dotenv = dbRequire("dotenv")
dotenv.config({ path: path.join(DB_DIR, ".env") })
// `file:./dev.db` di .env relatif terhadap CWD — paksa absolut ke packages/db
const rawUrl = process.env.DATABASE_URL
if (rawUrl?.startsWith("file:./")) {
  process.env.DATABASE_URL = `file:${path.join(DB_DIR, rawUrl.slice(6))}`
} else if (!rawUrl) {
  process.env.DATABASE_URL = `file:${path.join(DB_DIR, "dev.db")}`
}
const bcrypt = dbRequire("bcryptjs")

const SCHEMA_BY_DB = {
  sqlite: path.join(DB_DIR, "prisma", "schema.prisma"),
  pgsql: path.join(DB_DIR, "prisma-pgsql", "schema.prisma"),
}

const SEEDS = {
  User: [
    {
      role: "admin",
      username: "admin",
      email: "admin@admin.com",
      password: "admin1234",
    },
    {
      role: "user",
      username: "user",
      email: "user@user.com",
      password: "user1234",
    },
  ],
}

function parseSchema(file) {
  const text = fs.readFileSync(file, "utf8")
  const models = {}
  const modelBlocks = text.match(/^model\s+(\w+)\s*\{[^}]*\}/gm) ?? []
  for (const block of modelBlocks) {
    const name = block.match(/^model\s+(\w+)/)[1]
    const tableMap = block.match(/@@map\("([^"]+)"\)/)
    const fields = []
    for (const line of block.split("\n")) {
      const match = line.match(/^\s{2}(\w+)\s+([\w\[\]?]+)(\s+@[\s\S]*)?$/)
      if (!match || match[1].startsWith("_")) continue
      const attrs = match[3] ?? ""
      fields.push({
        name: match[1],
        type: match[2],
        isId: /@id/.test(attrs),
        isRelation: /@relation/.test(attrs),
        isUpdatedAt: /@updatedAt/.test(attrs),
        hasDefault: /@default/.test(attrs),
        optional: /[\[\]]/.test(match[2]) || /\?$/.test(match[2]),
      })
    }
    models[name] = { name, table: tableMap?.[1] ?? name, fields }
  }
  return models
}

function findModel(models, input) {
  const needle = String(input).toLowerCase()
  const name = Object.keys(models).find(
    (n) =>
      n.toLowerCase() === needle || models[n].table.toLowerCase() === needle
  )
  return name ? { name, fields: models[name].fields } : null
}

function coerce(type, raw) {
  const t = type.replace("?", "").replace(/\[\]/g, "")
  const value = String(raw).trim()
  if (value === "") return undefined
  switch (t) {
    case "Int":
      return parseInt(value, 10)
    case "BigInt":
      return BigInt(value)
    case "Float":
      return parseFloat(value)
    case "Boolean":
      return /^(true|1|y|yes)$/i.test(value)
    case "DateTime":
      return new Date(value)
    case "Json":
      return JSON.parse(value)
    case "Bytes":
      return Buffer.from(value, "hex")
    default:
      return value
  }
}

function printableValue(v) {
  if (v instanceof Date) return v.toISOString()
  if (typeof v === "bigint") return `${v}n`
  return v
}

function getClient(db) {
  const { prisma } = dbRequire(path.join(DB_DIR, "dist", "client"))
  const { getPrismaPgsql, isPgConfigured } = dbRequire(
    path.join(DB_DIR, "dist", "client-pgsql")
  )
  if (db === "pgsql" && !isPgConfigured()) {
    throw new Error(
      "Koneksi PostgreSQL belum di-set. Isi DATABASE_URL_PGSQL, POSTGRES_URL, atau PRISMA_DATABASE_URL di packages/db/.env"
    )
  }
  return db === "pgsql" ? getPrismaPgsql() : prisma
}

async function hashPasswords(data) {
  for (const key of Object.keys(data)) {
    if (
      key.toLowerCase().includes("password") &&
      typeof data[key] === "string"
    ) {
      data[key] = await bcrypt.hash(data[key], 10)
    }
  }
  return data
}

function kvFromArgs(kv) {
  const out = {}
  for (const arg of kv ?? []) {
    const eq = String(arg).indexOf("=")
    if (eq > 0) out[arg.slice(0, eq)] = arg.slice(eq + 1)
  }
  return out
}

async function collectData({ db, model, kvArgs }) {
  const models = parseSchema(SCHEMA_BY_DB[db])
  const data = {}
  for (const field of model.fields) {
    if (field.isRelation || field.isId || field.isUpdatedAt) continue
    if (kvArgs[field.name] !== undefined) {
      const value = coerce(field.type, String(kvArgs[field.name]))
      if (value !== undefined) data[field.name] = value
      continue
    }
    if (field.hasDefault) continue
    const label = `${field.name} (${field.type}${field.optional ? ", opsional" : " *"})`
    const raw = await clackText({
      message: label,
      placeholder: field.optional ? "kosong = lewati" : "wajib",
    })
    if (raw === null) {
      if (field.optional) continue
      throw new Error(`${field.name} wajib diisi.`)
    }
    if (field.optional && raw.trim() === "") continue
    if (!field.optional && raw.trim() === "") {
      throw new Error(`${field.name} wajib diisi.`)
    }
    const value = coerce(field.type, raw)
    if (value !== undefined) data[field.name] = value
  }
  await hashPasswords(data)
  return data
}

async function pickTable(db) {
  const models = parseSchema(SCHEMA_BY_DB[db])
  const choice = await clackSelect({
    message: "Pilih tabel",
    options: Object.keys(models).map((n) => ({
      value: n,
      label: `${n} (tabel "${models[n].table}")`,
    })),
  })
  if (!choice) throw new Error("Tidak ada tabel yang dipilih.")
  return { name: choice, fields: models[choice].fields }
}

async function dropAllTables(db, client) {
  if (db === "sqlite") {
    const rows = await client.$queryRawUnsafe(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    for (const row of rows) {
      await client.$executeRawUnsafe(`DROP TABLE IF EXISTS "${row.name}"`)
    }
    await client.$executeRawUnsafe("VACUUM")
    return rows.length
  }
  const rows = await client.$queryRawUnsafe(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
  )
  for (const row of rows) {
    await client.$executeRawUnsafe(
      `DROP TABLE IF EXISTS "${row.tablename}" CASCADE`
    )
  }
  return rows.length
}

// ── handler perintah ───────────────────────────────────────────────────────
export async function listTables({ db }) {
  const models = parseSchema(SCHEMA_BY_DB[db])
  console.log(Object.keys(models).join("\n"))
}

function splitTableArgs(args) {
  // format lama: [table] <nama> [kv...] — kata kunci "table" opsional
  const [maybeTable, ...rest] = args
  const isKeyword = maybeTable === "table"
  const name = isKeyword ? rest[0] : maybeTable
  const kv = isKeyword ? rest.slice(1) : rest
  return { name, kv }
}

export async function pushRow({ db, args }) {
  const models = parseSchema(SCHEMA_BY_DB[db])
  const { name, kv } = splitTableArgs(args)
  const client = getClient(db)
  const model = name ? findModel(models, name) : await pickTable(db)
  if (!model) {
    throw new Error(
      `Tabel '${name}' tidak ditemukan. Tabel yang ada: ${Object.keys(models).join(", ")}`
    )
  }
  const kvArgs = kvFromArgs(kv)
  console.log(`Push data ke tabel ${model.name} (${db})...`)
  const data = await collectData({ db, model, kvArgs })
  if (Object.keys(data).length === 0)
    throw new Error("Tidak ada data yang diisi.")
  const created = await client[model.name].create({ data })
  console.log("Berhasil. Row baru:")
  console.log(JSON.stringify(created, (k, v) => printableValue(v), 2))
}

export async function deleteRows({ db, args }) {
  const models = parseSchema(SCHEMA_BY_DB[db])
  const { name } = splitTableArgs(args)
  const client = getClient(db)
  if (!name) {
    const confirm = await clackText({
      message: `PERINGATAN: menghapus SEMUA tabel (${Object.keys(models).join(", ")}) beserta datanya di ${db}. Ketik HAPUS SEMUA:`,
    })
    if (confirm !== "HAPUS SEMUA") {
      console.log("Dibatalkan.")
      return
    }
    const count = await dropAllTables(db, client)
    console.log(
      `Berhasil menghapus ${count} tabel. Database ${db} sekarang kosong (schema belum dibuat ulang — jalankan db:push untuk restore).`
    )
    return
  }
  const model = findModel(models, name)
  if (!model) {
    throw new Error(
      `Tabel '${name}' tidak ditemukan. Tabel yang ada: ${Object.keys(models).join(", ")}`
    )
  }
  const result = await client[model.name].deleteMany({})
  console.log(
    `Berhasil menghapus ${result.count} baris dari tabel ${model.name}. Tabel tetap ada.`
  )
}

export async function seedRows({ db, args }) {
  const models = parseSchema(SCHEMA_BY_DB[db])
  const { name } = splitTableArgs(args)
  if (!name) {
    throw new Error(
      `Nama tabel tidak diberikan. Seed tersedia untuk: ${Object.keys(SEEDS).join(", ")}. Contoh: pnpm ${db} seed User`
    )
  }
  const model = findModel(models, name)
  if (!model) {
    throw new Error(
      `Tabel '${name}' tidak ditemukan. Tabel yang ada: ${Object.keys(models).join(", ")}`
    )
  }
  const seedRowsList = SEEDS[model.name]
  if (!seedRowsList) {
    throw new Error(
      `Tidak ada data seed untuk tabel ${model.name}. Seed tersedia untuk: ${Object.keys(SEEDS).join(", ")}`
    )
  }
  console.log(
    `Seed ${seedRowsList.length} data ke tabel ${model.name} (${db})...`
  )
  const client = getClient(db)
  for (const row of seedRowsList) {
    const data = await hashPasswords({ ...row })
    const created = await client[model.name].upsert({
      where: { email: data.email },
      update: data,
      create: data,
    })
    console.log(`  ${chalk.green("✓")} ${created.email} (${created.role})`)
  }
  console.log("Seed selesai. Jalankan ulang untuk memperbarui data yang sama.")
}

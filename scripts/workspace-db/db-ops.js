#!/usr/bin/env node
/* CLI utilitas data untuk @workspace/db
 * Penggunaan (dari root):
 *   node scripts/workspace-db/db-ops.js <sqlite|pgsql> push table [nama-table] [key=value...]
 *   node scripts/workspace-db/db-ops.js <sqlite|pgsql> delete table [nama-table]
 *   node scripts/workspace-db/db-ops.js <sqlite|pgsql> delete
 *   node scripts/workspace-db/db-ops.js <sqlite|pgsql> seed [table] [nama-table]
 *   node scripts/workspace-db/db-ops.js <sqlite|pgsql> tables
 * Alias pnpm: pnpm sqlite ... / pnpm pgsql ... (lihat package.json root & packages/db)
 */
const fs = require("node:fs")
const path = require("node:path")
const readline = require("node:readline")
const { createRequire } = require("node:module")

const ROOT = path.join(__dirname, "..", "..")
const DB_DIR = path.join(ROOT, "packages", "db")
const dbRequire = createRequire(path.join(DB_DIR, "package.json"))

const dotenv = dbRequire("dotenv")
dotenv.config({ path: path.join(DB_DIR, ".env") })
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
        optional: match[2].endsWith("?"),
        isRelation: /\brelation\b/.test(attrs),
        hasDefault: /@default/.test(attrs),
        isUpdatedAt: /@updatedAt/.test(attrs),
        isId: /@id\b/.test(attrs),
      })
    }
    models[name] = { fields, table: tableMap ? tableMap[1] : name }
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

function createLineSource() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const iter = rl[Symbol.asyncIterator]()
  return async function nextLine(question) {
    process.stdout.write(question)
    const { value, done } = await iter.next()
    return done ? undefined : value
  }
}

function coerce(type, raw) {
  const t = type.replace("?", "").replace(/\[\]/g, "")
  const value = raw.trim()
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

async function collectData({ db, model, fields, kvArgs, nextLine }) {
  const schemaFile = SCHEMA_BY_DB[db]
  const data = {}
  for (const field of fields) {
    if (field.isRelation || field.isId || field.isUpdatedAt) {
      continue
    }
    if (kvArgs[field.name] !== undefined) {
      const value = coerce(field.type, String(kvArgs[field.name]))
      if (value !== undefined) data[field.name] = value
      continue
    }
    if (field.hasDefault) {
      continue
    }
    const label = `${field.name} (${field.type}${field.optional ? ", opsional" : " *"})`
    const raw = await nextLine(`  ${label}: `)
    if (raw === undefined) {
      if (field.optional) continue
      console.error(`  ✗ ${field.name} wajib diisi.`)
      process.exit(1)
    }
    if (field.optional && raw.trim() === "") continue
    if (!field.optional && raw.trim() === "") {
      console.error(`  ✗ ${field.name} wajib diisi.`)
      process.exit(1)
    }
    const value = coerce(field.type, raw)
    if (value !== undefined) data[field.name] = value
  }
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

async function pickTable(nextLine, models) {
  const names = Object.keys(models)
  console.log("Pilih tabel:")
  names.forEach((n, i) =>
    console.log(`  ${i + 1}. ${n} (tabel "${models[n].table}")`)
  )
  const raw = await nextLine("  Nomor: ")
  const idx = parseInt(raw ?? "", 10) - 1
  if (Number.isNaN(idx) || idx < 0 || idx >= names.length) {
    console.error("Nomor tidak valid.")
    process.exit(1)
  }
  return { name: names[idx], fields: models[names[idx]].fields }
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

async function main() {
  const [db, action, ...rest] = process.argv.slice(2)

  if (!["sqlite", "pgsql"].includes(db)) {
    console.log(
      "Penggunaan:\n" +
        "  node scripts/workspace-db/db-ops.js <sqlite|pgsql> push table [nama] [key=value...]\n" +
        "  node scripts/workspace-db/db-ops.js <sqlite|pgsql> delete table [nama]\n" +
        "  node scripts/workspace-db/db-ops.js <sqlite|pgsql> delete\n" +
        "  node scripts/workspace-db/db-ops.js <sqlite|pgsql> seed [table] [nama]\n" +
        "  node scripts/workspace-db/db-ops.js <sqlite|pgsql> tables\n" +
        "Contoh: pnpm sqlite push table users email=a@b.co role=user"
    )
    process.exit(1)
  }

  const { prisma } = require(path.join(DB_DIR, "dist", "client"))
  const { getPrismaPgsql, isPgConfigured } = require(
    path.join(DB_DIR, "dist", "client-pgsql")
  )

  if (db === "pgsql" && !isPgConfigured()) {
    console.error(
      "Koneksi PostgreSQL belum di-set. Isi DATABASE_URL_PGSQL, POSTGRES_URL, atau PRISMA_DATABASE_URL di packages/db/.env"
    )
    process.exit(1)
  }

  const client = db === "pgsql" ? getPrismaPgsql() : prisma

  const models = parseSchema(SCHEMA_BY_DB[db])

  if (action === "tables") {
    console.log(Object.keys(models).join("\n"))
    return
  }

  if (action === "push") {
    const [, maybeTable] = rest
    const nextLine = createLineSource()
    const model = maybeTable
      ? findModel(models, maybeTable)
      : await pickTable(nextLine, models)
    if (!model) {
      console.error(
        `Tabel '${maybeTable}' tidak ditemukan. Tabel yang ada: ${Object.keys(models).join(", ")}`
      )
      process.exit(1)
    }
    const kvArgs = {}
    for (const arg of rest.slice(1)) {
      const eq = arg.indexOf("=")
      if (eq > 0) kvArgs[arg.slice(0, eq)] = arg.slice(eq + 1)
    }
    console.log(`Push data ke tabel ${model.name} (${db})...`)
    const data = await collectData({
      db,
      model,
      fields: model.fields,
      kvArgs,
      nextLine,
    })
    if (Object.keys(data).length === 0) {
      console.error("Tidak ada data yang diisi.")
      process.exit(1)
    }
    const created = await client[model.name].create({ data })
    console.log("Berhasil. Row baru:")
    console.log(JSON.stringify(created, (k, v) => printableValue(v), 2))
    return
  }

  if (action === "delete") {
    const tableName = rest[0] === "table" ? rest[1] : rest[0]
    if (!tableName) {
      const nextLine = createLineSource()
      const confirm = await nextLine(
        `PERINGATAN: akan menghapus SEMUA tabel (${Object.keys(models).join(", ")}) beserta datanya di database ${db}.\nKetik HAPUS SEMUA untuk lanjut: `
      )
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
    const model = findModel(models, tableName)
    if (!model) {
      console.error(
        `Tabel '${tableName}' tidak ditemukan. Tabel yang ada: ${Object.keys(models).join(", ")}`
      )
      process.exit(1)
    }
    const result = await client[model.name].deleteMany({})
    console.log(
      `Berhasil menghapus ${result.count} baris dari tabel ${model.name}. Tabel tetap ada.`
    )
    return
  }

  if (action === "seed") {
    const tableName = rest[0] === "table" ? rest[1] : rest[0]
    if (!tableName) {
      console.error(
        `Nama tabel tidak diberikan. Seed tersedia untuk: ${Object.keys(SEEDS).join(", ")}. Contoh: pnpm ${db} seed User`
      )
      process.exit(1)
    }
    const model = findModel(models, tableName)
    if (!model) {
      console.error(
        `Tabel '${tableName}' tidak ditemukan. Tabel yang ada: ${Object.keys(models).join(", ")}`
      )
      process.exit(1)
    }
    const seedRows = SEEDS[model.name]
    if (!seedRows) {
      console.error(
        `Tidak ada data seed untuk tabel ${model.name}. Seed tersedia untuk: ${Object.keys(SEEDS).join(", ")}`
      )
      process.exit(1)
    }
    console.log(
      `Seed ${seedRows.length} data ke tabel ${model.name} (${db})...`
    )
    for (const row of seedRows) {
      const data = { ...row }
      for (const key of Object.keys(data)) {
        if (
          key.toLowerCase().includes("password") &&
          typeof data[key] === "string"
        ) {
          data[key] = await bcrypt.hash(data[key], 10)
        }
      }
      const created = await client[model.name].upsert({
        where: { email: data.email },
        update: data,
        create: data,
      })
      console.log(`  ✓ ${created.email} (${created.role})`)
    }
    console.log(
      "Seed selesai. Jalankan ulang untuk memperbarui data yang sama."
    )
    return
  }

  console.error(`Aksi tidak dikenal: ${action}`)
  process.exit(1)
}

main().catch((err) => {
  console.error("Gagal:", err.message)
  process.exit(1)
})

import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import crypto from "node:crypto"
import { spawn, spawnSync } from "node:child_process"
import chalk from "chalk"
import ora from "ora"
import { ROOT, pnpmBin, box, errorBox } from "./ui.js"

const TEMPLATE_README = path.join(
  ROOT,
  "scripts",
  "workspace-clone",
  "templates",
  "README.md"
)
const COMMIT_MD = path.join(ROOT, "commit.md")
const COMMIT_MD_HEAD = `# 📝 Catatan Commit

Tabel ini diisi otomatis oleh \`pnpm push\` — satu baris per commit.

| datetime | commit | type | file list |
| -------- | ------ | ---- | --------- |
`

function hasBin(cmd) {
  try {
    return spawnSyncSafe(cmd, ["-v"]).status === 0
  } catch {
    return false
  }
}

function genSecret() {
  return crypto.randomBytes(32).toString("hex")
}

function step(i, total, label) {
  console.log(`\n${chalk.cyan(`── [${i}/${total}]`)} ${chalk.bold(label)}`)
}

function msgOk(text) {
  console.log(`    ${chalk.green(`✔ ${text}`)}`)
}

function msgInfo(text) {
  console.log(`    ${chalk.yellow(`ℹ ${text}`)}`)
}

function runStep(label, args, { logDir }) {
  const logFile = path.join(logDir, `${label.replace(/[^a-z0-9]+/gi, "-")}.log`)
  return new Promise((resolve, reject) => {
    const child = spawn(pnpmBin(), args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    })
    const out = fs.createWriteStream(logFile)
    child.stdout.pipe(out)
    child.stderr.pipe(out)
    child.on("error", (err) => reject(err))
    child.on("exit", (code) => {
      out.end()
      if (code === 0) resolve()
      else {
        const tail = fs
          .readFileSync(logFile, "utf8")
          .split("\n")
          .slice(-20)
          .map((l) => `    ${l}`)
          .join("\n")
        reject(
          new Error(
            `${label} gagal (exit ${code})\n${tail}\nLog lengkap: ${logFile}`
          )
        )
      }
    })
  })
}

async function runAll(steps, logDir) {
  for (const s of steps) {
    const sp = ora({ text: `${s.label} …`, color: "cyan" })
    sp.start()
    try {
      await runStep(s.label, s.args, { logDir })
      sp.succeed(s.label)
    } catch (err) {
      sp.fail(`${s.label} gagal`)
      throw err
    }
  }
}

export async function runBootstrap() {
  const started = Date.now()
  const logDir = fs.mkdtempSync(path.join(os.tmpdir(), "cli-bootstrap-"))
  let failed = false

  console.log(
    box(
      "⚡ Template Turborepo — Setup Otomatis",
      [[chalk.dim("Lingkungan · Dependensi · Database")]],
      { color: "cyan" }
    )
  )

  const nodeOk = hasBin("node")
  const pnpmOk = hasBin("pnpm")
  if (!nodeOk) {
    errorBox("✗ Node.js tidak ditemukan", [
      [chalk.red("Install Node.js ≥ 20 dulu — https://nodejs.org"), chalk.red],
    ])
    process.exit(1)
  }
  if (!pnpmOk) {
    errorBox("✗ pnpm tidak ditemukan", [
      [
        chalk.red(
          "Aktifkan lewat Corepack: corepack enable lalu pnpm bootstrap"
        ),
        chalk.red,
      ],
      [chalk.red("atau: npm i -g pnpm@10"), chalk.red],
    ])
    process.exit(1)
  }

  const projectName = path.basename(ROOT)
  console.log(
    `    ${chalk.green("✔")} ${chalk.bold("Node")} ${nodeVersion()}  ${chalk.dim("·")}  ${chalk.bold("pnpm")} ${pnpmVersion()}  ${chalk.dim("·")}  ${chalk.dim(`target: ${projectName}`)}`
  )

  try {
    // ── 1/5 Dokumen template ─────────────────────────────────────────────
    const readmeDir = path.join(ROOT, "Readme")
    if (fs.existsSync(readmeDir))
      fs.rmSync(readmeDir, { recursive: true, force: true })
    if (fs.existsSync(TEMPLATE_README)) {
      const tpl = fs.readFileSync(TEMPLATE_README, "utf8")
      fs.writeFileSync(
        path.join(ROOT, "README.md"),
        tpl.split("nama-proyek-anda").join(projectName)
      )
    }
    fs.writeFileSync(COMMIT_MD, COMMIT_MD_HEAD)

    // ── 2/4 Environment files ────────────────────────────────────────────
    step(1, 4, "Environment files")
    const apiEnv = path.join(ROOT, "apps", "api", ".env")
    if (fs.existsSync(apiEnv)) {
      msgInfo("apps/api/.env sudah ada — tidak diubah")
    } else {
      fs.copyFileSync(path.join(ROOT, "apps", "api", ".env.example"), apiEnv)
      const content = fs.readFileSync(apiEnv, "utf8")
      const secret = genSecret()
      if (/^JWT_SECRET=/m.test(content)) {
        fs.writeFileSync(
          apiEnv,
          content.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`)
        )
      } else {
        fs.appendFileSync(apiEnv, `\nJWT_SECRET=${secret}\n`)
      }
      msgOk("apps/api/.env dibuat — JWT_SECRET di-generate acak")
    }
    const dbEnv = path.join(ROOT, "packages", "db", ".env")
    if (fs.existsSync(dbEnv)) {
      msgInfo("packages/db/.env sudah ada — tidak diubah")
    } else {
      fs.copyFileSync(path.join(ROOT, "packages", "db", ".env.example"), dbEnv)
      msgOk("packages/db/.env dibuat — DATABASE_URL_PGSQL kosong (SQLite)")
    }

    // ── 3/4 Install dependencies ─────────────────────────────────────────
    step(2, 4, "Install dependencies")
    await runAll(
      [
        {
          label: "Install dependencies (pnpm install)",
          args: ["--reporter=append-only", "install"],
        },
      ],
      logDir
    )

    // ── 4/4 Generate Prisma Client & build ───────────────────────────────
    step(3, 4, "Generate Prisma Client & build")
    await runAll(
      [
        {
          label: "Generate Prisma Client (SQLite)",
          args: ["--filter", "@workspace/db", "db:generate"],
        },
        {
          label: "Generate Prisma Client (PostgreSQL)",
          args: ["--filter", "@workspace/db", "db:generate:pgsql"],
        },
        {
          label: "Build @workspace/db (dist/)",
          args: ["--filter", "@workspace/db", "build"],
        },
      ],
      logDir
    )

    // ── 5/4 Setup database ───────────────────────────────────────────────
    step(4, 4, "Setup database (SQLite)")
    await runAll(
      [
        {
          label: "Sinkronkan skema ke SQLite (db:push)",
          args: ["--filter", "@workspace/db", "db:push"],
        },
      ],
      logDir
    )

    const secs = Math.round((Date.now() - started) / 1000)
    console.log(
      box(
        "✅ Setup selesai 🎉",
        [[chalk.dim(`Lingkungan siap dalam ${secs}s`)]],
        { color: "green" }
      )
    )
    console.log(
      `  ${chalk.bold("Jalankan aplikasi:")}  ${chalk.cyan("$ pnpm dev")}`
    )
    console.log(`    • web    → ${chalk.cyan("http://localhost:3000")}`)
    console.log(`    • admin  → ${chalk.cyan("http://localhost:3001")}`)
    console.log(`    • api    → ${chalk.cyan("http://localhost:4000")}`)
    console.log(`\n  ${chalk.bold("Opsional:")}`)
    console.log(
      `    • ${chalk.cyan("pnpm sqlite seed User")}  → isi akun contoh (admin / user)`
    )
    console.log(
      `    • ${chalk.cyan("pnpm test")}              → jalankan semua test`
    )
    console.log(
      `    • PostgreSQL             → isi DATABASE_URL_PGSQL (panduan di GitHub repo)`
    )
  } catch (err) {
    failed = true
    console.error(chalk.red(`\n✗ ${err.message}`))
  } finally {
    if (!failed) fs.rmSync(logDir, { recursive: true, force: true })
    if (failed) process.exitCode = 1
  }
}

function spawnSyncSafe(cmd, args) {
  return spawnSync(cmd, args)
}

function nodeVersion() {
  try {
    return spawnSync("node", ["-v"]).stdout.toString().trim()
  } catch {
    return "?"
  }
}

function pnpmVersion() {
  try {
    return spawnSync(pnpmBin(), ["-v"]).stdout.toString().trim()
  } catch {
    return "?"
  }
}

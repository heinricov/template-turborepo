import path from "node:path"
import fs from "node:fs"
import { spawn } from "node:child_process"
import { performance } from "node:perf_hooks"
import chalk from "chalk"
import { ROOT, pnpmBin, clackSelect, clackConfirm, box } from "./ui.js"

const SRC_BY_MODE = {
  unitest: path.join(ROOT, "audit", "vitest", "src"),
  security: path.join(ROOT, "audit", "security", "src"),
}
const PKG_BY_MODE = {
  unitest: "@workspace/audit-vitest",
  security: "@workspace/audit-security",
}

const TEST_RE = /\.test\.(ts|tsx)$/

function hasTests(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .some((e) => e.isFile() && TEST_RE.test(e.name))
  } catch {
    return false
  }
}

function countTests(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && TEST_RE.test(e.name)).length
  } catch {
    return 0
  }
}

function listFolders(src) {
  return fs
    .readdirSync(src, { withFileTypes: true })
    .filter((e) => e.isDirectory() && hasTests(path.join(src, e.name)))
    .map((e) => e.name)
}

function listFiles(folder) {
  return fs
    .readdirSync(folder, { withFileTypes: true })
    .filter((e) => e.isFile() && TEST_RE.test(e.name))
    .map((e) => e.name)
}

function resolveMode(jenis) {
  if (!jenis) return null
  switch (jenis) {
    case "1":
    case "unitest":
    case "ui":
    case "unit":
      return "unitest"
    case "2":
    case "security":
      return "security"
    case "3":
    case "all":
    case "semua":
      return "all"
    default:
      throw new Error(
        `Mode tidak dikenal: ${jenis} — gunakan unitest/security/all`
      )
  }
}

function resolveFolder(src, arg) {
  const clean = String(arg).replace(/^src\//, "")
  if (
    !clean ||
    !fs.existsSync(path.join(src, clean)) ||
    !hasTests(path.join(src, clean))
  ) {
    throw new Error(
      `Folder tidak ditemukan: ${arg} — opsi: ${listFolders(src).join(", ") || "(tidak ada)"}`
    )
  }
  return clean
}

function resolveFile(src, folder, arg) {
  const clean = String(arg).replace(/^src\//, "")
  const base = path.basename(clean)
  const dirPart = path.dirname(clean)
  const rel = dirPart === "." ? folder : path.join(folder, dirPart)
  if (!fs.existsSync(path.join(src, rel, base))) {
    throw new Error(`File tidak ditemukan: ${arg}`)
  }
  return path.join(rel, base)
}

async function apiRunning() {
  try {
    await fetch("http://localhost:4000/", {
      signal: AbortSignal.timeout(2000),
    })
    return true
  } catch {
    return false
  }
}

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", cwd: ROOT })
    child.on("error", reject)
    child.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(" ")} — exit ${code}`))
    })
  })
}

export async function runTests({ jenis, folder, file }) {
  let mode = resolveMode(jenis)
  if (!mode) {
    const choice = await clackSelect({
      message: "Pilih jenis test",
      options: [
        { value: "unitest", label: "Unit test (102 test UI — audit-vitest)" },
        {
          value: "security",
          label: "Security (37 test JWT — audit-security, butuh API dev)",
        },
        { value: "all", label: "Semua (unit + security)" },
      ],
    })
    mode = choice ?? "all"
  }

  if (mode === "security" || mode === "all") {
    const running = await apiRunning()
    if (!running) {
      console.log(
        box(
          "⚠ API dev tidak berjalan di http://localhost:4000",
          [
            [chalk.red("Test security/integration akan gagal."), chalk.red],
            [
              chalk.red("Jalankan dulu: pnpm dev (di terminal lain)"),
              chalk.red,
            ],
          ],
          { color: "yellow" }
        )
      )
      const ok = await clackConfirm({
        message: "Lanjut tetap jalankan?",
        initialValue: false,
      })
      if (!ok) {
        console.log("Dibatalkan.")
        return
      }
    }
  }

  let target = ""
  if (mode === "unitest" || mode === "security") {
    const src = SRC_BY_MODE[mode]
    let selFolder = folder ? resolveFolder(src, folder) : null
    if (!selFolder) {
      const folders = listFolders(src)
      if (folders.length > 0) {
        selFolder =
          (await clackSelect({
            message: `Pilih folder test (${mode})`,
            options: [
              ...folders.map((f) => ({
                value: f,
                label: `${f}   (${countTests(path.join(src, f))} file test)`,
              })),
              { value: "*", label: "* (semua folder)" },
            ],
          })) || ""
      }
    }
    let selFile = ""
    if (selFolder && file) selFile = resolveFile(src, selFolder, file)
    else if (selFolder) {
      const files = listFiles(path.join(src, selFolder))
      if (files.length > 0) {
        selFile =
          (await clackSelect({
            message: `Pilih file test di ${selFolder}`,
            options: [
              ...files.map((f) => ({ value: f, label: f })),
              { value: "*", label: "* (semua file)" },
            ],
          })) || ""
      }
    }
    if (selFile) target = `src/${selFolder}/${path.basename(selFile)}`
    else if (selFolder) target = `src/${selFolder}`
  }

  const started = performance.now()
  const pkg = PKG_BY_MODE[mode]
  try {
    if (mode === "all") {
      console.log(`==> Semua test (unit + security)`)
      await runCommand(pnpmBin(), ["exec", "turbo", "test"])
    } else if (target) {
      console.log(
        `==> ${mode === "unitest" ? "Unit test" : "Security test"} (${pkg}) — target: ${target}`
      )
      await runCommand(pnpmBin(), ["--filter", pkg, "run", "test", target])
    } else {
      console.log(
        `==> ${mode === "unitest" ? "Unit test" : "Security test"} (${pkg})`
      )
      await runCommand(pnpmBin(), ["exec", "turbo", "test", "--filter", pkg])
    }
  } finally {
    const secs = Math.round((performance.now() - started) / 1000)
    console.log(
      `\n    ${chalk.green(`✔ Selesai dalam ${secs}s — mode: ${mode}`)}`
    )
  }
}

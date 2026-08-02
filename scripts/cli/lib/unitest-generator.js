import path from "node:path"
import fs from "node:fs"
import { spawn, execFileSync } from "node:child_process"
import chalk from "chalk"
import { ROOT, pnpmBin, clackSelect, clackConfirm } from "./ui.js"

const SRC_DIR = path.join(ROOT, "packages", "shadcn", "src")
const DEST_DIR = path.join(ROOT, "audit", "vitest", "src")

const DECL_RE =
  /^(export\s+default\s+|export\s+)?(function|const)\s+([A-Za-z_][A-Za-z0-9_]*)/

// ── daftar folder & file sumber ────────────────────────────────────────────
function listDirs() {
  const out = []
  const walk = (dir, rel) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue
      const r = rel ? `${rel}/${e.name}` : e.name
      if (r === "styles" || r.startsWith("styles/")) continue
      const full = path.join(dir, e.name)
      const has = fs
        .readdirSync(full)
        .some((f) => f !== "index.ts" && /\.(ts|tsx)$/.test(f))
      if (has) out.push(r)
      walk(full, r)
    }
  }
  walk(SRC_DIR, "")
  return out.sort()
}

function listFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f !== "index.ts" && /\.(ts|tsx)$/.test(f))
    .sort()
}

function testExists(rel, base, ext) {
  return fs.existsSync(
    path.join(DEST_DIR, rel, `${base.replace(/\.\w+$/, "")}.test.${ext}`)
  )
}

// ── parser sumber (port dari awk di unitest bash) ─────────────────────────
function parseSource(source) {
  const entries = []
  const byName = new Map()
  let cur = null
  let inSig = false
  let sig = ""

  const entryOf = (name) => {
    let e = byName.get(name)
    if (!e) {
      e = { name, slots: [], events: false, danger: false }
      byName.set(name, e)
      entries.push(e)
    }
    return e
  }

  const captureSlots = (line) => {
    if (!cur) return
    const m = line.match(/data-slot="([^"]*)"/)
    if (m) byName.get(cur)?.slots.push(m[1])
  }

  const endSig = () => {
    if (cur && inSig) {
      const e = byName.get(cur)
      if (e) {
        if (/\bonClick|\bonChange/.test(sig)) e.events = true
        if (
          /(^|\s)\s*(data|columns|items|rows)(,|}|\s|$)/.test(sig) ||
          /\bon[A-Z][A-Za-z]*:[^=?]/.test(sig)
        ) {
          e.danger = true
        }
      }
    }
    inSig = false
  }

  const lines = source.split("\n")
  for (const line of lines) {
    if (DECL_RE.test(line)) {
      inSig = false
      sig = ""
      const m = line.match(DECL_RE)
      cur = m[3]
      entryOf(cur)
      if (line.includes("({")) {
        inSig = true
        sig = line + "\n"
      }
      continue
    }
    if (inSig) {
      sig += line + "\n"
      captureSlots(line)
      // `}: {` = lanjutan signature tipe inline — belum berakhir
      if (/^\s*}\s*:\s*\{\s*$/.test(line)) continue
      if (/^\s*}\s*\)?\s*(\{|=>|:\s|$)/.test(line)) endSig()
      continue
    }
    captureSlots(line)
  }
  return entries
}

const ALL_UPPER_RE = /^[A-Z0-9_]+$/

// ── import path ────────────────────────────────────────────────────────────
function importPath(rel, base) {
  if (rel === "components/data-form" || rel === "components/data-table") {
    return `@workspace/shadcn/${rel}`
  }
  return `@workspace/shadcn/${rel}/${base}`
}

// ── hierarki Base UI ───────────────────────────────────────────────────────
function partDepth(name) {
  if (name.endsWith("Item")) return 1
  if (
    /(Trigger|Content|Panel|Header|Control|Indicator|Value|Group|Separator|Title|Description|Close|Icon|Label|Arrow)$/.test(
      name
    )
  ) {
    return 2
  }
  return 0
}

function wrapOf(target, order) {
  const dT = partDepth(target)
  if (dT === 0) return { open: "", close: "" }
  const chain = []
  for (const p of order) {
    if (p === target) break
    if (partDepth(p) < dT) chain.push(p)
  }
  return {
    open: chain.map((p) => `<${p}>`).join(""),
    close: [...chain]
      .reverse()
      .map((p) => `</${p}>`)
      .join(""),
  }
}

// ── menu & resolusi (non-TTY → null → argumen wajib) ───────────────────────
async function pickDir() {
  const dirs = listDirs()
  if (dirs.length === 0) return null
  const choice = await clackSelect({
    message: "Pilih folder sumber (packages/shadcn/src)",
    options: dirs.map((d) => ({
      value: d,
      label: `${d}   (${listFiles(path.join(SRC_DIR, d)).length} file)`,
    })),
  })
  return choice ?? null
}

async function pickSrcFile(dir) {
  const files = listFiles(path.join(SRC_DIR, dir))
  const choice = await clackSelect({
    message: `Pilih file di ${dir}`,
    options: files.map((f) => ({
      value: f,
      label: testExists(dir, f, path.extname(f).slice(1))
        ? `${f}   (✓ sudah ada test)`
        : f,
    })),
  })
  return choice ?? null
}

function resolveDir(arg) {
  const clean = String(arg).replace(/^src\//, "")
  if (!clean || !fs.existsSync(path.join(SRC_DIR, clean))) {
    throw new Error(
      `Folder tidak ditemukan: ${arg} — opsi: ${listDirs().join(", ")}`
    )
  }
  return clean
}

function resolveFile(dir, arg) {
  let clean = String(arg).replace(/^src\//, "")
  if (clean.includes("*")) throw new Error(`Wildcard tidak didukung: ${arg}`)
  const base = path.basename(clean)
  if (fs.existsSync(path.join(SRC_DIR, dir, base))) return base
  if (fs.existsSync(path.join(SRC_DIR, dir, `${base}.ts`))) return `${base}.ts`
  if (fs.existsSync(path.join(SRC_DIR, dir, `${base}.tsx`)))
    return `${base}.tsx`
  throw new Error(`File tidak ditemukan di ${dir}: ${arg}`)
}

// ── generator utama ────────────────────────────────────────────────────────
export async function createTest({ folder, file }) {
  if (file && file.includes("/")) {
    const parts = file.split("/")
    file = parts.pop()
    folder = folder ? `${folder}/${parts.join("/")}` : parts.join("/")
  }

  let dir = folder ? resolveDir(folder) : await pickDir()
  if (!dir)
    throw new Error(
      "Folder tidak diberikan — gunakan: pnpm unitest create <folder> [file]"
    )
  let srcFile = file ? resolveFile(dir, file) : await pickSrcFile(dir)
  if (!srcFile)
    throw new Error(
      `File tidak diberikan di folder ${dir} — gunakan: pnpm unitest create ${dir} <file>`
    )

  const base = srcFile.replace(/\.\w+$/, "")
  const ext = srcFile.split(".").pop()
  const outRel = `${dir}/${base}.test.${ext}`
  const out = path.join(DEST_DIR, outRel)
  const source = fs.readFileSync(path.join(SRC_DIR, dir, srcFile), "utf8")

  if (testExists(dir, srcFile, ext)) {
    const ok = await clackConfirm({
      message: `Test sudah ada: ${outRel} — timpa?`,
      initialValue: false,
    })
    if (ok === false) {
      console.log("    Dilewati — test tidak diubah.")
      return
    }
  }

  // ── metadata komponen ──────────────────────────────────────────────────
  const entries = parseSource(source).filter(
    (e) =>
      !ALL_UPPER_RE.test(e.name) && !(ext === "tsx" && !/^[A-Z]/.test(e.name))
  )
  if (entries.length === 0) {
    throw new Error(`Tidak ada komponen/fungsi yang dikenali di ${srcFile}`)
  }
  const order = entries.map((e) => e.name)

  // ── kebutuhan import ───────────────────────────────────────────────────
  let needHook = 0
  let needLib = 0
  let needRender = 0
  let needUser = 0
  let needVi = 0
  const usedNames = []
  for (const e of entries) {
    if (e.name.startsWith("use") && ext === "ts") {
      needHook = 1
      usedNames.push(e.name)
    } else if (ext === "ts") {
      needLib = 1
      usedNames.push(e.name)
    } else if (
      e.danger ||
      e.name.endsWith("Content") ||
      e.name.endsWith("Panel")
    ) {
      continue
    } else {
      needRender = 1
      usedNames.push(e.name)
      if (e.events) {
        needUser = 1
        needVi = 1
      }
    }
  }

  const usedDefaults = []
  const usedNamed = []
  for (const name of usedNames) {
    const re = new RegExp(
      `^[ \\t]*export[ \\t]+default[ \\t]+(function|const)[ \\t]+${name}([(<:]|$)`,
      "m"
    )
    if (re.test(source)) usedDefaults.push(name)
    else usedNamed.push(name)
  }

  const importLine = (() => {
    if (usedDefaults.length === 0 && usedNamed.length === 0) return ""
    let line = "import "
    if (usedDefaults.length > 0) line += usedDefaults[0]
    if (usedNamed.length > 0) {
      if (usedDefaults.length > 0) line += ", "
      line += `{ ${usedNamed.join(", ")} }`
    }
    line += ` from "${importPath(dir, base)}"`
    return line
  })()

  // ── konten ─────────────────────────────────────────────────────────────
  let content =
    "// File uji otomatis dari `pnpm unitest create` — sesuaikan sesuai kebutuhan.\n\n"
  if (needRender) {
    content += `import { render } from "@testing-library/react"\n`
    if (needUser)
      content += `import { userEvent } from "@testing-library/user-event"\n`
    if (needVi) content += `import { vi } from "vitest"\n`
  }
  if (needHook)
    content += `import { renderHook } from "@testing-library/react"\n`
  if (needRender || needHook || needLib) {
    content += `import { describe, expect, it } from "vitest"\n`
  } else {
    content += `import { describe, it } from "vitest"\n`
  }
  content += "\n"
  if (importLine) content += `${importLine}\n`

  const byName = new Map(entries.map((e) => [e.name, e]))
  for (const name of order) {
    const e = byName.get(name)
    const wrap = wrapOf(name, order)
    const slot = e.slots[0] ?? ""
    if (name.startsWith("use") && ext === "ts") {
      content += `\ndescribe("${name}()", () => {
  it("mengembalikan nilai boolean", () => {
    const { result } = renderHook(() => ${name}())
    expect(typeof result.current).toBe("boolean")
  })
})
`
    } else if (ext === "ts") {
      content += `\ndescribe("${name}()", () => {
  it("terdefinisi sebagai fungsi", () => {
    expect(typeof ${name}).toBe("function")
  })
  it.todo("perilaku: ${name}")
})
`
    } else if (name.endsWith("Content") || name.endsWith("Panel")) {
      content += `\ndescribe("${name}", () => {
  it.todo("merender saat item/dialog terbuka")

  // Konten hanya dirender saat terbuka (default tertutup) — contoh:
  // it("merender saat terbuka", () => {
  //   const { container } = render(${wrap.open}<${name} />${wrap.close})
  //   expect(container.querySelector('[data-slot="${slot}"]')).toBeInTheDocument()
  // })
})
`
    } else if (e.danger) {
      content += `\ndescribe("${name}", () => {
  it.todo("merender dengan props wajib")

  // Contoh (aktifkan setelah props wajib terpenuhi):
  // it("merender tanpa error", () => {
  //   const { container } = render(<${name} {...props} />)
  //   expect(container.firstChild).not.toBeNull()
  // })
})
`
    } else if (slot) {
      content += `\ndescribe("${name}", () => {
  it("merender dengan data-slot: ${slot}", () => {
    const { container } = render(${wrap.open}<${name} />${wrap.close})
    expect(container.querySelector('[data-slot="${slot}"]')).toBeInTheDocument()
  })

  it("menerapkan className tambahan", () => {
    const { container } = render(${wrap.open}<${name} className="mt-4" />${wrap.close})
    expect(container.querySelector('[data-slot="${slot}"]')).toHaveClass("mt-4")
  })
`
      if (e.events) {
        content += `
  it("menangani event onClick", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { container } = render(${wrap.open}<${name} onClick={onClick} />${wrap.close})
    await user.click(container.querySelector('[data-slot="${slot}"]') as HTMLElement)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
`
      }
      content += `})
`
    } else {
      content += `\ndescribe("${name}", () => {
  it("merender tanpa error", () => {
    const { container } = render(${wrap.open}<${name} />${wrap.close})
    expect(container.firstChild).not.toBeNull()
  })
})
`
    }
  }

  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, content)
  try {
    execFileSync(pnpmBin(), ["exec", "prettier", "--write", out], {
      cwd: ROOT,
      stdio: "ignore",
    })
  } catch {
    // prettier gagal — file tetap ditulis apa adanya
  }

  console.log(`\n    ${chalk.green("✔ Test dibuat:")} ${outRel}`)
  console.log(`      import : ${importPath(dir, base)}`)

  const run = await clackConfirm({
    message: "Jalankan test-nya sekarang?",
    initialValue: false,
  })
  if (run === true) {
    await new Promise((resolve, reject) => {
      const child = spawn(
        pnpmBin(),
        ["--filter", "@workspace/audit-vitest", "run", "test", outRel],
        { stdio: "inherit", cwd: ROOT }
      )
      child.on("error", reject)
      child.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error(`exit ${code}`))
      )
    })
  }
}

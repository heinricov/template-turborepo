import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"
import { ROOT } from "./ui.js"

const OLD_NAME = "template-turborepo-01"
const NAME_RE = /^[a-zA-Z0-9._-]+$/
const TARGETS = ["README.md", "Readme/use.md"]

export async function runRename({ name }) {
  if (!name) throw new Error("Penggunaan: pnpm morea rename <nama-proyek>")
  if (!NAME_RE.test(name)) {
    throw new Error(
      "Nama hanya boleh berisi huruf, angka, titik, strip, atau underscore."
    )
  }

  console.log(chalk.cyan(`==> Rename proyek: ${OLD_NAME} → ${name}`))

  const pkg = path.join(ROOT, "package.json")
  if (fs.existsSync(pkg)) {
    const content = fs.readFileSync(pkg, "utf8")
    if (content.includes(`"name": "${OLD_NAME}"`)) {
      fs.writeFileSync(
        pkg,
        content.replace(`"name": "${OLD_NAME}"`, `"name": "${name}"`)
      )
      console.log(`  ${chalk.green("✓")} package.json name → ${name}`)
    } else {
      console.log(`  - package.json sudah bukan '${OLD_NAME}' (tidak diubah)`)
    }
  }

  for (const rel of TARGETS) {
    const f = path.join(ROOT, rel)
    if (!fs.existsSync(f)) continue
    const content = fs.readFileSync(f, "utf8")
    if (content.includes(OLD_NAME)) {
      fs.writeFileSync(f, content.split(OLD_NAME).join(name))
      console.log(`  ${chalk.green("✓")} ${rel} diperbarui`)
    }
  }

  console.log(`\nSelesai. Nama proyek sekarang: ${name}`)
  console.log(
    "Jika repo Anda berbeda dari template, ganti juga URL git clone di README.md."
  )
}

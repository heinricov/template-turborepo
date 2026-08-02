import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import chalk from "chalk"
import { ROOT, gitBin, nowStamp, clackText, clackSelect } from "./ui.js"

const COMMIT_MD = path.join(ROOT, "commit.md")
const COMMIT_MD_HEAD = `# 📝 Catatan Commit

Tabel ini diisi otomatis oleh \`pnpm push\` — satu baris per commit.

| datetime | commit | type | file list |
| -------- | ------ | ---- | --------- |
`

function git(args, opts = {}) {
  const r = spawnSync(gitBin(), args, { cwd: ROOT, ...opts })
  if (r.error) throw r.error
  return r
}

function escPipe(s) {
  return String(s).replace(/\|/g, "\\|")
}

export async function runPush({ message, type }) {
  let msg = message
  if (msg == null) {
    msg = await clackText({
      message: "Commit message",
      placeholder: "commit - <waktu> (Enter untuk default)",
    })
  }
  msg ||= `commit - ${nowStamp()}`

  let t = type
  if (t == null) {
    t = await clackSelect({
      message: "Tipe commit",
      initialValue: "update",
      options: [
        { value: "add", label: "add — fitur baru" },
        { value: "fix", label: "fix — perbaikan" },
        { value: "update", label: "update — perubahan lain" },
      ],
    })
  }
  t ||= "update"
  if (!["add", "fix", "update"].includes(t)) {
    throw new Error("Tipe harus salah satu dari: add, fix, update.")
  }

  const add = git(["add", "."])
  if (add.status !== 0) {
    throw new Error(`git add gagal:\n${add.stderr?.toString()}`)
  }

  const diff = git(["diff", "--cached", "--quiet"])
  if (diff.status === 0) {
    console.log("Tidak ada perubahan untuk di-commit — lanjut push.")
  } else {
    if (!fs.existsSync(COMMIT_MD)) {
      fs.writeFileSync(COMMIT_MD, COMMIT_MD_HEAD)
    }
    const nameOnly = git(["diff", "--cached", "--name-only"], {
      encoding: "utf8",
    })
    const files = nameOnly.stdout
      .toString()
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean)
      .filter((f) => f !== "commit.md")
    const fileList =
      files.length > 0
        ? files.map((f) => `\`${escPipe(f)}\``).join(", ")
        : "`commit.md`"
    const row = `| ${nowStamp()} | ${escPipe(msg)} | ${t} | ${fileList} |\n`
    fs.appendFileSync(COMMIT_MD, row)
    git(["add", "commit.md"])
  }

  const commit = git(["commit", "-m", msg], { stdio: "inherit" })
  if (commit.status !== 0) {
    console.log("Tidak ada perubahan untuk di-commit — lanjut push.")
  }
  const push = git(["push"], { stdio: "inherit" })
  if (push.status !== 0) {
    console.error(chalk.red("Push gagal."))
    process.exitCode = 1
  }
}

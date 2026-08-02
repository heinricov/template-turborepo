import path from "node:path"
import { fileURLToPath } from "node:url"
import chalk from "chalk"
import boxen from "boxen"
import * as clack from "@clack/prompts"
import ora from "ora"

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.."
)
export const CLI_VERSION = "1.0.0"

export const isTTY = () =>
  Boolean(process.stdin.isTTY && process.stdout.isTTY && process.stderr.isTTY)

export const pnpmBin = () =>
  process.platform === "win32" ? "pnpm.cmd" : "pnpm"

export const gitBin = () => (process.platform === "win32" ? "git.exe" : "git")

export function banner() {
  const text = [
    `${chalk.bold("⚡ cli — CLI lokal Template Turborepo")}`,
    `${chalk.dim(`v${CLI_VERSION} · khusus project ini (tidak dipublish)`)}`,
  ].join("\n")
  console.log(
    boxen(text, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: "round",
      borderColor: "cyan",
      title: "CLI",
      titleAlignment: "left",
    })
  )
}

export function box(title, lines, { color = "cyan", bold = true } = {}) {
  const body = lines
    .map((l) => {
      const [text, style = chalk.dim] = l
      return ` ${style(text)}`
    })
    .join("\n")
  return boxen(`${bold ? chalk.bold(title) : title}\n\n${body}`, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: "round",
    borderColor: color,
    title: "MOREA",
    titleAlignment: "left",
  })
}

export function errorBox(title, lines) {
  console.log(box(title, lines, { color: "red" }))
}

async function guard(result) {
  if (clack.isCancel(result)) {
    clack.cancel("Dibatalkan.")
    process.exit(0)
  }
  return result
}

export async function clackSelect({ message, options, initialValue }) {
  if (!isTTY()) return null
  return guard(
    await clack.select({
      message,
      options,
      initialValue: initialValue,
    })
  )
}

export async function clackText({ message, placeholder, initialValue }) {
  if (!isTTY()) return null
  return guard(
    await clack.text({ message, placeholder, initialValue: initialValue })
  )
}

export async function clackConfirm({ message, initialValue }) {
  if (!isTTY()) return null
  return guard(
    await clack.confirm({ message, initialValue: Boolean(initialValue) })
  )
}

export function spinner(label) {
  return ora({ text: label, color: "cyan" })
}

export const nowStamp = () => {
  const d = new Date()
  const p = (n, w = 2) => String(n).padStart(w, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

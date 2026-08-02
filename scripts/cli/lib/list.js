import boxen from "boxen"
import chalk from "chalk"

const PNPM_ALIASES = [
  ["pnpm test", "cli test"],
  ["pnpm unitest", "cli unitest"],
  ["pnpm push", "cli push"],
  ["pnpm bootstrap", "cli bootstrap"],
  ["pnpm rename", "cli rename"],
  ["pnpm sqlite / pgsql", "cli db sqlite / pgsql"],
]

export function printList(program) {
  const rows = []
  const walk = (cmd, prefix) => {
    if (cmd.parent) {
      const usage = cmd.usage() ?? ""
      const cleanUsage = /\[options\]/.test(usage) ? "" : usage
      rows.push([
        `${prefix}${cmd.name()}${cleanUsage ? ` ${cleanUsage}` : ""}`,
        (cmd.description() ?? "").split("\n")[0].trim(),
      ])
    }
    for (const sub of cmd.commands ?? []) {
      walk(sub, cmd.parent ? `${prefix}${cmd.name()} ` : prefix)
    }
  }
  walk(program, "cli ")

  const body = rows
    .flatMap(([name, desc]) => {
      const lines = [`  ${chalk.cyan(name)}`]
      if (desc) lines.push(`      ${chalk.dim(desc)}`)
      return lines
    })
    .join("\n")

  console.log(
    boxen(`${chalk.bold("Perintah CLI yang tersedia")}\n\n${body}`, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: "round",
      borderColor: "cyan",
      title: "CLI",
      titleAlignment: "left",
      width: 76,
    })
  )

  const aliasBody = PNPM_ALIASES.map(
    ([alias, cmd]) =>
      `  ${chalk.green(alias.padEnd(22))}${chalk.dim(`→ ${cmd}`)}`
  ).join("\n")
  console.log(
    boxen(`${chalk.bold("Alias pnpm (tanpa menulis 'cli')")}\n\n${aliasBody}`, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: "round",
      borderColor: "green",
      title: "ALIAS",
      titleAlignment: "left",
      width: 76,
    })
  )
  console.log(
    chalk.dim("Detail & contoh tiap perintah: pnpm cli <perintah> --help\n")
  )
}

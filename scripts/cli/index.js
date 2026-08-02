#!/usr/bin/env node
// cli — CLI lokal untuk project Turborepo ini.
// Setup tunggal: definisi perintah di `commands/`, implementasi di `lib/`.
import { Command } from "commander"
import { banner, CLI_VERSION } from "./lib/ui.js"
import { register as registerTest } from "./commands/test.js"
import { register as registerUnitest } from "./commands/unitest.js"
import { register as registerPush } from "./commands/push.js"
import { register as registerBootstrap } from "./commands/bootstrap.js"
import { register as registerRename } from "./commands/rename.js"
import { register as registerDb } from "./commands/db.js"
import { register as registerList } from "./commands/list.js"

const program = new Command()
  .name("cli")
  .description(
    "CLI lokal untuk project Turborepo — test, generator unit test, git push, setup bootstrap, rename, dan utilitas database. Khusus project ini, tidak dipublish."
  )
  .version(CLI_VERSION, "-V, --version", "Tampilkan versi CLI")
  .showHelpAfterError()
  .configureOutput({
    outputError: (str, write) =>
      write(`${str}Gunakan \`pnpm cli --help\` untuk daftar perintah.\n`),
  })

registerTest(program)
registerUnitest(program)
registerPush(program)
registerBootstrap(program)
registerRename(program)
registerDb(program)
registerList(program)

if (process.argv.slice(2).length === 0) {
  banner()
  program.help()
}

await program.parseAsync(process.argv)

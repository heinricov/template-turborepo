// Peruntukan: perintah `cli test` — jalankan unitest/security/all dengan pilihan folder & file.
export function register(program) {
  const run =
    (fn) =>
    async (...args) => {
      try {
        await fn(...args)
      } catch (err) {
        program.error(err.message)
      }
    }

  program
    .command("test")
    .description(
      "Jalankan test — pilih unitest / security / all (folder & file)"
    )
    .usage("[unitest|security|all] [folder] [file]")
    .argument(
      "[jenis]",
      "unitest | security | all (alias: 1/2/3, ui, unit, semua)"
    )
    .argument("[folder]", "folder di src/ (mis. ui, lib, components/auth)")
    .argument("[file]", "file test (mis. button.test.tsx)")
    .addHelpText(
      "after",
      `\nContoh:
  pnpm test                    → menu interaktif
  pnpm test unitest ui         → semua test di folder ui
  pnpm test unitest ui/button.test.tsx → satu file
  pnpm test security unit      → folder unit (security)`
    )
    .action(
      run(async (jenis, folder, file) => {
        const { runTests } = await import("../lib/test-runner.js")
        await runTests({ jenis, folder, file })
      })
    )
}

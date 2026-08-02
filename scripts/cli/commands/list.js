// Peruntukan: perintah `cli list` — daftar semua perintah CLI yang tersedia.
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
    .command("list")
    .description(
      "Daftar semua perintah CLI yang tersedia (termasuk alias pnpm)"
    )
    .addHelpText("after", `\nContoh:\n  pnpm cli list`)
    .action(
      run(async () => {
        const { printList } = await import("../lib/list.js")
        printList(program)
      })
    )
}

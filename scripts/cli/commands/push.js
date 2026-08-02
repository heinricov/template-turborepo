// Peruntukan: perintah `morea push` — git add → commit → push + catat ke commit.md.
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
    .command("push")
    .description(
      "git add . → commit → push, plus catat commit ke commit.md (tabel: datetime, commit, type, file list)"
    )
    .usage("[-m <pesan>] [-t <type>]")
    .option(
      "-m, --message <pesan>",
      "commit message (default: commit - <waktu>)"
    )
    .option(
      "-t, --type <type>",
      "tipe commit: add | fix | update (default: update)"
    )
    .addHelpText(
      "after",
      `\nContoh:
  pnpm morea push                      → prompt interaktif
  pnpm morea push -m "fix: typo" -t fix → langsung commit & push`
    )
    .action(
      run(async (opts) => {
        const { runPush } = await import("../lib/push.js")
        await runPush({ message: opts.message, type: opts.type })
      })
    )
}

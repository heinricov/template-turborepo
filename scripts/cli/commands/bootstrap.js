// Peruntukan: perintah `cli bootstrap` — setup awal project (idempotent).
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
    .command("bootstrap")
    .description(
      "Setup awal setelah clone — dokumen, env, install, Prisma Client, database (idempotent)"
    )
    .addHelpText(
      "after",
      `\nContoh:
  pnpm bootstrap                 → setup lengkap
  (corepack enable lalu pnpm bootstrap bila pnpm belum ada)`
    )
    .action(
      run(async () => {
        const { runBootstrap } = await import("../lib/bootstrap.js")
        await runBootstrap()
      })
    )
}

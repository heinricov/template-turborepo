// Peruntukan: perintah `morea rename` — ganti nama project setelah clone (idempotent).
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
    .command("rename")
    .description("Ganti nama project (package.json, README.md, Readme/use.md)")
    .usage("<nama-proyek>")
    .argument("<nama>", "nama baru — huruf, angka, titik, strip, underscore")
    .addHelpText(
      "after",
      `\nContoh:
  pnpm morea rename my-project
Catatan: URL GitHub di hero-section.tsx dan README tidak disentuh (menunjuk repo template).`
    )
    .action(
      run(async (name) => {
        const { runRename } = await import("../lib/rename.js")
        await runRename({ name })
      })
    )
}

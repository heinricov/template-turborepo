// Peruntukan: perintah `morea unitest create` — generator skeleton unit test untuk @workspace/shadcn.
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

  const unitest = program
    .command("unitest")
    .description(
      "Generator unit test untuk @workspace/shadcn (test disalin ke audit/vitest/src/)"
    )
    .usage("[create] [folder] [file]")

  unitest
    .command("create")
    .description(
      "Buat skeleton test — render nyata (heuristik) atau it.todo untuk props wajib"
    )
    .usage("[folder] [file]")
    .argument("[folder]", "folder sumber di packages/shadcn/src (mis. ui)")
    .argument("[file]", "file sumber (mis. accordion.tsx)")
    .addHelpText(
      "after",
      `\nContoh:
  pnpm morea unitest create              → menu pilih folder & file
  pnpm morea unitest create ui           → pilih file di folder ui
  pnpm morea unitest create ui accordion.tsx → buat test langsung`
    )
    .action(
      run(async (folder, file) => {
        const { createTest } = await import("../lib/unitest-generator.js")
        await createTest({ folder, file })
      })
    )

  unitest.action(() => {
    unitest.help()
  })
}

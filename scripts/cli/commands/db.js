// Peruntukan: perintah `morea db <sqlite|pgsql> ...` — utilitas data (push/delete/seed/tables).
function registerDbGroup(group) {
  const run =
    (fn) =>
    async (...args) => {
      try {
        await fn(...args)
      } catch (err) {
        group.error(err.message)
      }
    }

  group
    .command("tables")
    .description("Daftar tabel dari schema")
    .action(
      run(async () => {
        const { listTables } = await import("../lib/db-ops.js")
        await listTables({ db: group.name() })
      })
    )

  group
    .command("push")
    .description(
      "Tambah baris (kunci=value; field wajib & tanpa default ditanyakan)"
    )
    .usage("[table] <nama-tabel> [kunci=value...]")
    .argument(
      "[args...]",
      "kata kunci 'table' (opsional), nama tabel, lalu kunci=value"
    )
    .addHelpText(
      "after",
      `\nContoh:
  pnpm morea db sqlite push table users email=a@b.co role=user
  pnpm morea db sqlite push users email=a@b.co`
    )
    .action(
      run(async (args) => {
        const { pushRow } = await import("../lib/db-ops.js")
        await pushRow({ db: group.name(), args: args ?? [] })
      })
    )

  group
    .command("delete")
    .description("Hapus baris satu tabel, atau SEMUA tabel (ketik HAPUS SEMUA)")
    .usage("[table] <nama-tabel>")
    .argument("[args...]", "kata kunci 'table' (opsional), lalu nama tabel")
    .addHelpText(
      "after",
      `\nContoh:
  pnpm morea db sqlite delete table users   → hapus semua baris tabel users
  pnpm morea db sqlite delete               → hapus SEMUA tabel (konfirmasi HAPUS SEMUA)`
    )
    .action(
      run(async (args) => {
        const { deleteRows } = await import("../lib/db-ops.js")
        await deleteRows({ db: group.name(), args: args ?? [] })
      })
    )

  group
    .command("seed")
    .description("Isi data contoh (User: admin / user)")
    .usage("[table] <nama-tabel>")
    .argument("[args...]", "kata kunci 'table' (opsional), lalu nama tabel")
    .action(
      run(async (args) => {
        const { seedRows } = await import("../lib/db-ops.js")
        await seedRows({ db: group.name(), args: args ?? [] })
      })
    )
}

export function register(program) {
  const db = program
    .command("db")
    .description("Utilitas data database (SQLite / PostgreSQL)")
    .usage("<sqlite|pgsql> <tables|push|delete|seed>")

  for (const name of ["sqlite", "pgsql"]) {
    registerDbGroup(db.command(name).description(`Operasi database ${name}`))
  }

  db.action(() => {
    db.help()
  })
}

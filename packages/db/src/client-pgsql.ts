import { PrismaClient } from "./generated/pgsql/client"
import { PrismaPg } from "@prisma/adapter-pg"

let prismaPgsql: PrismaClient | undefined

export function getPgConnectionString(): string | undefined {
  return (
    process.env.DATABASE_URL_PGSQL ??
    process.env.POSTGRES_URL ??
    process.env.PRISMA_DATABASE_URL
  )
}

export function isPgConfigured(): boolean {
  return Boolean(getPgConnectionString())
}

function createPrismaClient() {
  const connectionString = getPgConnectionString()

  if (!connectionString) {
    throw new Error(
      "Koneksi PostgreSQL belum di-set. Isi DATABASE_URL_PGSQL, POSTGRES_URL, atau PRISMA_DATABASE_URL (lihat packages/db/prisma-pgsql/schema.prisma)"
    )
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export function getPrismaPgsql(): PrismaClient {
  if (!prismaPgsql) {
    prismaPgsql = createPrismaClient()
  }
  return prismaPgsql
}

export type { PrismaClient }

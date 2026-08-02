import "dotenv/config"
import { defineConfig } from "prisma/config"

function getPgUrl(): string {
  return (
    process.env.DATABASE_URL_PGSQL ??
    process.env.POSTGRES_URL ??
    process.env.PRISMA_DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost:5432/template"
  )
}

export default defineConfig({
  schema: "prisma-pgsql/schema.prisma",
  datasource: {
    url: getPgUrl(),
  },
})

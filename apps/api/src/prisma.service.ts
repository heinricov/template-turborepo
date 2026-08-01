import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import { prisma } from "@workspace/db/client"
import { getPrismaPgsql, isPgConfigured } from "@workspace/db/client-pgsql"

type DbClient = {
  $connect(): Promise<void>
  $disconnect(): Promise<void>
  user: (typeof prisma)["user"]
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  readonly isPgsql = isPgConfigured()
  client: DbClient = (this.isPgsql ? getPrismaPgsql() : prisma) as unknown as DbClient

  async onModuleInit() {
    await this.client.$connect()
    this.logger.log(
      this.isPgsql ? "PrismaORM ✅ DB PostgreSQL Berhasil" : "PrismaORM ✅ DB Sqlite Berhasil"
    )
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
  }
}

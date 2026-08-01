import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import type { PrismaClient } from "@prisma/client"
import { prisma } from "@workspace/db/client"

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  client: PrismaClient = prisma

  async onModuleInit() {
    await this.client.$connect()
    this.logger.log("PrismaORM ✅ DB Sqlite Berhasil")
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
  }
}

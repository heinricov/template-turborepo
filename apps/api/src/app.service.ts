import { Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma.service"

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello(): Promise<string> {
    const count = await this.prisma.client.user.count()
    return `Hello from API! Users in DB: ${count}`
  }
}

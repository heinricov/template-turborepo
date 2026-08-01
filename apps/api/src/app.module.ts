import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { JwtGuard, JwtModule } from "@workspace/auth"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { PrismaService } from "./prisma.service"
import { AuthModule } from "./auth/auth.module"
import { UserModule } from "./user/user.module"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

@Module({
  imports: [JwtModule.register({ secret: JWT_SECRET, expiresIn: "1d" }), AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, { provide: APP_GUARD, useClass: JwtGuard }],
})
export class AppModule {}

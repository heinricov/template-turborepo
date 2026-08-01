import { Injectable, UnauthorizedException } from "@nestjs/common"
import * as bcrypt from "bcryptjs"
import { JwtService } from "@workspace/auth"
import { PrismaService } from "../prisma.service"
import type { LoginInput } from "@workspace/validation/user"

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(data: LoginInput) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: data.email },
    })

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException("Email atau password salah")
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }
  }
}

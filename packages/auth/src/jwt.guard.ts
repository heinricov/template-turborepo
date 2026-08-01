import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { PUBLIC_KEY } from "./jwt.constants"
import { JwtService } from "./jwt.service"
import type { AuthRequest } from "./jwt.types"

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<AuthRequest>()
    const token = this.extractToken(request.headers.authorization)
    if (!token) {
      throw new UnauthorizedException("Token tidak ditemukan")
    }

    try {
      request.user = this.jwtService.verify(token)
    } catch {
      throw new UnauthorizedException("Token tidak valid atau kedaluwarsa")
    }
    return true
  }

  private extractToken(authorization?: string): string | null {
    if (!authorization) return null
    const [scheme, token] = authorization.split(" ")
    return scheme === "Bearer" && token ? token : null
  }
}

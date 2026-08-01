import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common"
import { PUBLIC_KEY } from "./jwt.constants"
import type { AuthRequest, JwtPayload } from "./jwt.types"

export const Public = () => SetMetadata(PUBLIC_KEY, true)

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | undefined => {
    return context.switchToHttp().getRequest<AuthRequest>().user
  },
)

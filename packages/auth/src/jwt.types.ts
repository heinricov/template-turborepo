import type { FactoryProvider, ModuleMetadata } from "@nestjs/common"

export type JwtPayload = {
  sub: string
  email: string
  role: string
}

export type JwtModuleOptions = {
  secret: string
  expiresIn?: string | number
}

export type JwtModuleAsyncOptions = Pick<ModuleMetadata, "imports"> & {
  useFactory: (...args: unknown[]) => JwtModuleOptions | Promise<JwtModuleOptions>
  inject?: FactoryProvider["inject"]
}

export type AuthRequest = {
  headers: Record<string, string | undefined>
  user?: JwtPayload
}

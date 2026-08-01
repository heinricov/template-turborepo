import { Inject, Injectable } from "@nestjs/common"
import * as jwt from "jsonwebtoken"
import { JWT_OPTIONS } from "./jwt.constants"
import type { JwtModuleOptions, JwtPayload } from "./jwt.types"

@Injectable()
export class JwtService {
  constructor(@Inject(JWT_OPTIONS) private readonly options: JwtModuleOptions) {}

  sign(payload: JwtPayload, expiresIn?: string | number): string {
    return jwt.sign(payload, this.options.secret, {
      expiresIn: (expiresIn ?? this.options.expiresIn ?? "1d") as jwt.SignOptions["expiresIn"],
    })
  }

  verify<T extends JwtPayload = JwtPayload>(token: string): T {
    return jwt.verify(token, this.options.secret) as T
  }
}

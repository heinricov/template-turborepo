import { Controller, Post, Body } from "@nestjs/common"
import { loginSchema } from "@workspace/validation/user"
import { Public } from "@workspace/auth"
import { ZodValidationPipe } from "../common/zod.pipe"
import { AuthService } from "./auth.service"
import type { LoginInput } from "@workspace/validation/user"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.authService.login(body)
  }
}

import { Controller, Get, Post, Patch, Delete, Param, Body } from "@nestjs/common"
import { registerSchema, updateProfileSchema } from "@workspace/validation/user"
import { Public } from "@workspace/auth"
import { ZodValidationPipe } from "../common/zod.pipe"
import { UserService } from "./user.service"
import type { RegisterInput, UpdateProfileInput } from "@workspace/validation/user"

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  async create(@Body(new ZodValidationPipe(registerSchema)) body: RegisterInput) {
    return this.userService.create(body)
  }

  @Public()
  @Get()
  async findAll() {
    return this.userService.findAll()
  }

  @Public()
  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.userService.findById(id)
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileInput,
  ) {
    return this.userService.update(id, body)
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.userService.remove(id)
  }
}

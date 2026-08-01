import { PipeTransform, BadRequestException } from "@nestjs/common"
import type { ZodSchema } from "zod"

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value)

    if (!result.success) {
      const messages = result.error.issues
        .map((i) => `${String(i.path[0])}: ${i.message}`)
        .join(", ")
      throw new BadRequestException(messages)
    }

    return result.data
  }
}

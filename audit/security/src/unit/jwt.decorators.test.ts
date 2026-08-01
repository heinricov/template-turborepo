import "reflect-metadata"

import { createRequire } from "node:module"

import type { ExecutionContext } from "@nestjs/common"
import { describe, expect, it } from "vitest"

import { CurrentUser, Public, PUBLIC_KEY } from "@workspace/auth"

const require = createRequire(import.meta.url)
const { ROUTE_ARGS_METADATA } = require("@nestjs/common/constants") as {
  ROUTE_ARGS_METADATA: string
}

describe("@Public()", () => {
  it("men-set metadata PUBLIK_KEY = true pada handler", () => {
    class Controller {
      @Public()
      method() {}
    }

    expect(Reflect.getMetadata(PUBLIC_KEY, Controller.prototype.method)).toBe(true)
  })

  it("tidak men-set metadata tanpa dekorator", () => {
    class Controller {
      method() {}
    }

    expect(Reflect.getMetadata(PUBLIC_KEY, Controller.prototype.method)).toBeUndefined()
  })
})

describe("@CurrentUser()", () => {
  function registerCurrentUser(controller: object, methodName: string, index = 0) {
    CurrentUser()(controller, methodName, index)
    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      (controller as { constructor: object }).constructor,
      methodName
    )
    const entry = Object.values(metadata as Record<string, unknown>).find(
      (value) =>
        typeof value === "object" &&
        value !== null &&
        typeof (value as { factory?: unknown }).factory === "function"
    ) as { factory: (data: unknown, context: ExecutionContext) => unknown }

    expect(entry).toBeDefined()
    return entry
  }

  it("mendaftarkan parameter index 0 dengan factory", () => {
    class Controller {
      method() {}
    }

    const entry = registerCurrentUser(Controller.prototype, "method")

    expect(entry).toBeDefined()
  })

  it("factory mengambil user dari request", () => {
    class Controller {
      method() {}
    }

    const entry = registerCurrentUser(Controller.prototype, "method")
    const user = { sub: "1", email: "a@example.com" }
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext

    expect(entry.factory(undefined, context)).toEqual(user)
  })

  it("factory mengembalikan undefined saat request tidak memiliki user", () => {
    class Controller {
      method() {}
    }

    const entry = registerCurrentUser(Controller.prototype, "method")
    const context = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext

    expect(entry.factory(undefined, context)).toBeUndefined()
  })
})

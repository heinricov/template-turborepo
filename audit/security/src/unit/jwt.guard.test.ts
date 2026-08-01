import "reflect-metadata"

import { UnauthorizedException, type ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { describe, expect, it } from "vitest"

import { JwtGuard, JwtService, PUBLIC_KEY } from "@workspace/auth"

const SECRET = "audit-security-test-secret"

function makeContext(options: {
  handler?: object
  headers?: Record<string, string>
}) {
  const request: { headers: Record<string, string>; user?: unknown } = {
    headers: options.headers ?? {},
  }

  return {
    getHandler: () => options.handler ?? {},
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
    get request() {
      return request
    },
  } as unknown as ExecutionContext & { request: typeof request }
}

describe("JwtGuard", () => {
  const service = new JwtService({ secret: SECRET, expiresIn: "1d" })
  const reflector = new Reflector()
  const guard = new JwtGuard(service, reflector)

  it("mengizinkan route yang ditandai @Public()", () => {
    const handler = () => {}
    Reflect.defineMetadata(PUBLIC_KEY, true, handler)

    const context = makeContext({ handler })
    expect(guard.canActivate(context)).toBe(true)
  })

  it("mengizinkan route publik di level class", () => {
    class PublicController {}
    Reflect.defineMetadata(PUBLIC_KEY, true, PublicController)

    const context = {
      getHandler: () => ({}),
      getClass: () => PublicController,
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    } as unknown as ExecutionContext

    expect(guard.canActivate(context)).toBe(true)
  })

  it("menolak request tanpa header Authorization", () => {
    const context = makeContext({})

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it("menolak request dengan skema non-Bearer", () => {
    const context = makeContext({ headers: { authorization: "Basic abc123" } })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it("menolak token yang tidak valid", () => {
    const context = makeContext({
      headers: { authorization: "Bearer token-palsu" },
    })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it("menolak token dengan payload yang dimanipulasi", () => {
    const token = service.sign({ sub: "1", email: "a@example.com", role: "user" })
    const [header, , signature] = token.split(".")
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: "1", email: "penyerang@example.com", role: "user" })
    ).toString("base64url")
    const tampered = [header, tamperedPayload, signature].join(".")

    const context = makeContext({
      headers: { authorization: `Bearer ${tampered}` },
    })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it("mengisi request.user saat token valid", () => {
    const token = service.sign({ sub: "7", email: "valid@example.com", role: "user" })
    const context = makeContext({
      headers: { authorization: `Bearer ${token}` },
    })

    const result = guard.canActivate(context)

    expect(result).toBe(true)
    expect(context.request.user).toMatchObject({
      sub: "7",
      email: "valid@example.com",
    })
  })

  it("menolak token yang sudah kedaluwarsa", async () => {
    const expired = service.sign({ sub: "1", email: "a@example.com", role: "user" }, "1s")
    await new Promise((resolve) => setTimeout(resolve, 1100))

    const context = makeContext({
      headers: { authorization: `Bearer ${expired}` },
    })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })
})

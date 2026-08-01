import { describe, expect, it } from "vitest"

import { JwtService, type JwtPayload } from "@workspace/auth"

const SECRET = "audit-security-test-secret"

type Decoded = JwtPayload & { exp: number; iat: number }

function makeService(options: Partial<{ secret: string; expiresIn: string }> = {}) {
  return new JwtService({ secret: options.secret ?? SECRET, expiresIn: options.expiresIn ?? "1d" })
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

describe("JwtService", () => {
  it("menghasilkan token JWT dengan 3 segmen", () => {
    const token = makeService().sign({ sub: "1", email: "a@example.com", role: "user" })

    expect(token.split(".")).toHaveLength(3)
  })

  it("verify mengembalikan payload yang sama", () => {
    const service = makeService()
    const payload = { sub: "42", email: "user@example.com", role: "user" }

    const token = service.sign(payload)
    const decoded = service.verify<typeof payload>(token)

    expect(decoded.sub).toBe("42")
    expect(decoded.email).toBe("user@example.com")
  })

  it("menyimpan klaim exp sesuai opsi default", () => {
    const service = makeService()
    const token = service.sign({ sub: "1", email: "a@example.com", role: "user" })

    const decoded = service.verify<Decoded>(token)
    expect(decoded.exp).toBeGreaterThan(nowSeconds())
  })

  it("menggunakan expiresIn eksplisit saat diberikan", () => {
    const service = makeService()
    const token = service.sign(
      { sub: "1", email: "a@example.com", role: "user" },
      "2h"
    )

    const decoded = service.verify<Decoded>(token)
    const ttlSeconds = decoded.exp - nowSeconds()
    expect(ttlSeconds).toBeGreaterThanOrEqual(7100)
    expect(ttlSeconds).toBeLessThanOrEqual(7300)
  })

  it("menolak token yang sudah kedaluwarsa", async () => {
    const service = makeService()
    const token = service.sign({ sub: "1", email: "a@example.com", role: "user" }, "1s")

    await new Promise((resolve) => setTimeout(resolve, 1100))

    expect(() => service.verify(token)).toThrow()
  })

  it("menolak token dengan signature yang dimanipulasi", () => {
    const service = makeService()
    const token = service.sign({ sub: "1", email: "a@example.com", role: "user" })
    const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a")

    expect(() => service.verify(tampered)).toThrow()
  })

  it("menolak token yang ditandatangani dengan secret lain", () => {
    const token = makeService({ secret: "secret-pertama" }).sign({
      sub: "1",
      email: "a@example.com",
      role: "user",
    })

    expect(() => makeService({ secret: "secret-berbeda" }).verify(token)).toThrow()
  })

  it("menolak string yang bukan token", () => {
    expect(() => makeService().verify("bukan-token")).toThrow()
  })
})

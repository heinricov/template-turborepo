import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { JwtService } from "@workspace/auth"

const BASE_URL = process.env.API_URL ?? "http://localhost:4000"

type ApiResult = {
  status: number
  body: unknown
}

async function api(path: string, init: RequestInit = {}): Promise<ApiResult> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  return { status: res.status, body }
}

function getDevJwtSecret(): string {
  const envPath = resolve(import.meta.dirname, "../../../../apps/api/.env")
  const raw = readFileSync(envPath, "utf8")
  const match = raw.match(/^JWT_SECRET=(.+)$/m)
  if (!match?.[1]) {
    throw new Error(`JWT_SECRET tidak ditemukan di ${envPath}`)
  }
  return match[1].trim()
}

const email = `audit-${Date.now()}@example.com`
const password = "password123"
let token = ""
let userId = ""

beforeAll(async () => {
  try {
    const res = await fetch(`${BASE_URL}/users`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) {
      throw new Error(`status ${res.status}`)
    }
  } catch (error) {
    throw new Error(
      `API dev tidak tersedia di ${BASE_URL}. Jalankan "pnpm dev" terlebih dahulu (apps/api di port 4000). Detail: ${(error as Error).message}`
    )
  }
})

afterAll(async () => {
  if (token && userId) {
    try {
      await api(`/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // cleanup best-effort
    }
  }
})

describe("Audit keamanan API dev", () => {
  describe("Kontrol akses", () => {
    it("endpoint publik GET /users dapat diakses tanpa token", async () => {
      const res = await api("/users")
      expect(res.status).toBe(200)
    })

    it("endpoint terproteksi PATCH /users/:id menolak tanpa token (401)", async () => {
      const res = await api("/users/1", {
        method: "PATCH",
        body: JSON.stringify({ username: "x" }),
      })

      expect(res.status).toBe(401)
    })

    it("endpoint terproteksi DELETE /users/:id menolak tanpa token (401)", async () => {
      const res = await api("/users/1", { method: "DELETE" })
      expect(res.status).toBe(401)
    })

    it("menolak token dengan skema non-Bearer", async () => {
      const res = await api("/users/1", {
        method: "PATCH",
        headers: { authorization: "Basic abc" },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(401)
    })
  })

  describe("Serangan token", () => {
    const jwt = new JwtService({ secret: getDevJwtSecret(), expiresIn: "1d" })

    it("menolak token acak (401)", async () => {
      const res = await api("/users/1", {
        method: "PATCH",
        headers: { Authorization: "Bearer abc.def.ghi" },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(401)
    })

    it("menolak token dengan payload dimanipulasi (401)", async () => {
      const legit = jwt.sign({ sub: "1", email, role: "user" })
      const [header, , signature] = legit.split(".")
      const forgedPayload = Buffer.from(
        JSON.stringify({ sub: "1", email: "penyerang@example.com", role: "user" })
      ).toString("base64url")
      const tampered = [header, forgedPayload, signature].join(".")

      const res = await api("/users/1", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${tampered}` },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(401)
    })

    it("menolak token yang sudah kedaluwarsa (401)", async () => {
      const expired = jwt.sign({ sub: "1", email, role: "user" }, "1s")
      await new Promise((resolve) => setTimeout(resolve, 1100))

      const res = await api("/users/1", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${expired}` },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(401)
    })
  })

  describe("Validasi input", () => {
    it("menolak password kurang dari 8 karakter (400)", async () => {
      const res = await api("/users", {
        method: "POST",
        body: JSON.stringify({ email, password: "short", role: "user" }),
      })

      expect(res.status).toBe(400)
    })

    it("menolak email tidak valid (400)", async () => {
      const res = await api("/users", {
        method: "POST",
        body: JSON.stringify({ email: "bukan-email", password, role: "user" }),
      })

      expect(res.status).toBe(400)
    })

    it("menolak role tidak dikenal (400)", async () => {
      const res = await api("/users", {
        method: "POST",
        body: JSON.stringify({ email, password, role: "superadmin" }),
      })

      expect(res.status).toBe(400)
    })
  })

  describe("Siklus hidup autentikasi", () => {
    it("registrasi user baru berhasil (publik)", async () => {
      const res = await api("/users", {
        method: "POST",
        body: JSON.stringify({ email, password, role: "user" }),
      })

      expect(res.status).toBe(201)
      userId = (res.body as { id: string }).id
      expect(userId).toBeTruthy()
    })

    it("menolak registrasi email duplikat (409)", async () => {
      const res = await api("/users", {
        method: "POST",
        body: JSON.stringify({ email, password, role: "user" }),
      })

      expect(res.status).toBe(409)
    })

    it("menolak login dengan password salah (401)", async () => {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: "password-salah" }),
      })

      expect(res.status).toBe(401)
    })

    it("login berhasil mengembalikan token", async () => {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      expect(res.status).toBe(201)
      token = (res.body as { token: string }).token
      expect(token).toBeTruthy()
    })

    it("token hasil login dapat mengakses endpoint terproteksi", async () => {
      const res = await api(`/users/${userId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: "audit-user" }),
      })

      expect(res.status).toBe(200)
    })

    it("token hasil login dapat menghapus user sendiri", async () => {
      const res = await api(`/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      expect(res.status).toBe(200)
    })
  })
})

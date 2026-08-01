import { afterEach, describe, expect, it, vi } from "vitest"

import { apiFetch } from "@workspace/shadcn/lib/api"

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as Response
}

describe("apiFetch()", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("mengirim header Content-Type JSON secara default", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    await apiFetch("/users")

    expect(fetchMock).toHaveBeenCalledWith(
      "/users",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    )
  })

  it("menambahkan Authorization Bearer saat token diberikan", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    await apiFetch("/users", { token: "abc123" })

    expect(fetchMock).toHaveBeenCalledWith(
      "/users",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer abc123",
        }),
      })
    )
  })

  it("tidak menambahkan Authorization tanpa token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    await apiFetch("/users")

    const headers = (fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Record<
      string,
      string
    >
    expect(headers).not.toHaveProperty("Authorization")
  })

  it("mengizinkan header custom menimpa default", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    await apiFetch("/users", {
      headers: { "Content-Type": "text/plain", "X-Custom": "1" },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "/users",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "text/plain",
          "X-Custom": "1",
        }),
      })
    )
  })

  it("mengembalikan data pada respons sukses", async () => {
    const data = [{ id: 1, email: "a@example.com" }]
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(data)))

    const result = await apiFetch<typeof data>("/users")

    expect(result).toEqual(data)
  })

  it("melempar Error dengan pesan dari backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ message: "Token tidak valid atau kedaluwarsa" }, { ok: false, status: 401 })
      )
    )

    await expect(apiFetch("/users")).rejects.toThrow("Token tidak valid atau kedaluwarsa")
  })

  it("melempar Error fallback HTTP status saat body bukan JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("invalid json")
        },
      } as unknown as Response)
    )

    await expect(apiFetch("/users")).rejects.toThrow("HTTP 500")
  })

  it("menyebarkan error jaringan", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))

    await expect(apiFetch("/users")).rejects.toThrow("Failed to fetch")
  })
})

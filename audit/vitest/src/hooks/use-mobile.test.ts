// File uji otomatis dari `pnpm unitest create` — sesuaikan sesuai kebutuhan.

import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useIsMobile } from "@workspace/shadcn/hooks/use-mobile"

describe("useIsMobile()", () => {
  it("mengembalikan nilai boolean", () => {
    const { result } = renderHook(() => useIsMobile())
    expect(typeof result.current).toBe("boolean")
  })
})

import { describe, expect, it } from "vitest"

import { cn } from "@workspace/shadcn/lib/utils"

describe("cn()", () => {
  it("menggabungkan beberapa string class", () => {
    expect(cn("a", "b", "c")).toBe("a b c")
  })

  it("mengabaikan nilai falsy", () => {
    expect(cn("a", false, null, undefined, 0, "b")).toBe("a b")
  })

  it("mendukung objek kondisional", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false }, "px-2")).toBe(
      "text-red-500 px-2"
    )
  })

  it("mendukung array bersarang", () => {
    expect(cn(["a", ["b", ["c"]]])).toBe("a b c")
  })

  it("menyelesaikan konflik class tailwind (twMerge)", () => {
    expect(cn("px-2 px-4")).toBe("px-4")
    expect(cn("bg-red-500 bg-blue-500")).toBe("bg-blue-500")
  })

  it("mengembalikan string kosong tanpa argumen", () => {
    expect(cn()).toBe("")
    expect(cn(undefined)).toBe("")
  })
})

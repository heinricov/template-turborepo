import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Label } from "@workspace/shadcn/ui/label"

describe("Label", () => {
  it("merender teks label dengan htmlFor", () => {
    render(<Label htmlFor="email">Alamat Email</Label>)

    const label = screen.getByText("Alamat Email")
    expect(label.tagName).toBe("LABEL")
    expect(label).toHaveAttribute("for", "email")
    expect(label).toHaveAttribute("data-slot", "label")
  })

  it("menerapkan className tambahan", () => {
    render(<Label className="uppercase">Nama</Label>)
    expect(screen.getByText("Nama").className).toContain("uppercase")
  })
})

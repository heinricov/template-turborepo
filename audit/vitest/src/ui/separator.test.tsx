import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Separator } from "@workspace/shadcn/ui/separator"

describe("Separator", () => {
  it("merender horizontal secara default", () => {
    render(<Separator />)
    const separator = screen.getByRole("separator")
    expect(separator).toHaveAttribute("data-slot", "separator")
    expect(separator).toHaveAttribute("data-orientation", "horizontal")
  })

  it("merender vertikal saat orientation=vertical", () => {
    render(<Separator orientation="vertical" />)
    expect(screen.getByRole("separator")).toHaveAttribute(
      "data-orientation",
      "vertical"
    )
  })
})

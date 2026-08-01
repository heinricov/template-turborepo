import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ScrollArea } from "@workspace/shadcn/ui/scroll-area"

describe("ScrollArea", () => {
  it("merender konten di dalam viewport", () => {
    render(
      <ScrollArea className="h-64">
        <p>Konten panjang yang bisa di-scroll</p>
      </ScrollArea>
    )

    expect(screen.getByText("Konten panjang yang bisa di-scroll")).toBeVisible()
    expect(
      screen.getByText("Konten panjang yang bisa di-scroll").closest(
        "[data-slot=scroll-area-viewport]"
      )
    ).toBeInTheDocument()
  })

  it("merender ScrollBar sebagai komponen terpisah", () => {
    const { container } = render(
      <ScrollArea>
        <p>Konten</p>
      </ScrollArea>
    )

    expect(container.querySelector("[data-slot=scroll-area]")).not.toBeNull()
  })
})

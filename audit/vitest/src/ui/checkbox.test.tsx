import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Checkbox } from "@workspace/shadcn/ui/checkbox"

describe("Checkbox", () => {
  it("merender sebagai checkbox", () => {
    render(<Checkbox />)
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-slot", "checkbox")
  })

  it("melaporkan checked saat diklik (uncontrolled)", async () => {
    const user = userEvent.setup()
    render(<Checkbox defaultChecked={false} />)
    const checkbox = screen.getByRole("checkbox")

    await user.click(checkbox)

    expect(checkbox).toHaveAttribute("data-checked")
    expect(checkbox).toHaveAttribute("aria-checked", "true")
  })

  it("memicu onCheckedChange saat diklik", async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<Checkbox onCheckedChange={onCheckedChange} />)

    await user.click(screen.getByRole("checkbox"))

    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true)
  })

  it("mendukung state controlled", () => {
    render(<Checkbox checked />)
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-checked")
  })

  it("menandai aria-invalid", () => {
    render(<Checkbox aria-invalid />)
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true")
  })
})

import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Input } from "@workspace/shadcn/ui/input"

describe("Input", () => {
  it("merender dengan data-slot dan placeholder", () => {
    render(<Input placeholder="Nama lengkap" />)
    const input = screen.getByPlaceholderText("Nama lengkap")
    expect(input).toHaveAttribute("data-slot", "input")
  })

  it("mengisi nilai dan memicu onChange", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)

    await user.type(screen.getByRole("textbox"), "halo dunia")

    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole("textbox")).toHaveValue("halo dunia")
  })

  it("menghormati prop type", () => {
    const { container } = render(<Input type="password" placeholder="Password" />)
    expect(container.querySelector("input")).toHaveAttribute("type", "password")
  })

  it("memblokir input saat disabled", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Input disabled onChange={onChange} />)

    await user.type(screen.getByRole("textbox"), "x")

    expect(onChange).not.toHaveBeenCalled()
  })

  it("menerapkan className tambahan", () => {
    render(<Input className="w-64" />)
    expect(screen.getByRole("textbox").className).toContain("w-64")
  })
})

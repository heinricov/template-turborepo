import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Textarea } from "@workspace/shadcn/ui/textarea"

describe("Textarea", () => {
  it("merender dengan data-slot dan placeholder", () => {
    render(<Textarea placeholder="Tulis pesan" />)
    const textarea = screen.getByPlaceholderText("Tulis pesan")
    expect(textarea).toHaveAttribute("data-slot", "textarea")
  })

  it("mengisi nilai dan memicu onChange", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} />)

    await user.type(screen.getByRole("textbox"), "pesan panjang")

    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole("textbox")).toHaveValue("pesan panjang")
  })

  it("memblokir input saat disabled", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Textarea disabled onChange={onChange} />)

    await user.type(screen.getByRole("textbox"), "x")

    expect(onChange).not.toHaveBeenCalled()
  })
})

import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/shadcn/ui/input-group"

describe("InputGroup", () => {
  it("merender addon, input, dan button", () => {
    render(
      <InputGroup>
        <InputGroupAddon align="inline-start">Rp</InputGroupAddon>
        <InputGroupInput aria-label="harga" />
        <InputGroupButton>Max</InputGroupButton>
      </InputGroup>
    )

    expect(screen.getByText("Rp")).toHaveAttribute("data-slot", "input-group-addon")
    expect(screen.getByRole("textbox", { name: "harga" })).toHaveAttribute(
      "data-slot",
      "input-group-control"
    )
    expect(screen.getByRole("button", { name: "Max" })).toBeInTheDocument()
  })

  it("memindahkan fokus ke input saat addon diklik", async () => {
    const user = userEvent.setup()
    render(
      <InputGroup>
        <InputGroupAddon>Rp</InputGroupAddon>
        <InputGroupInput aria-label="harga" />
      </InputGroup>
    )

    await user.click(screen.getByText("Rp"))

    expect(screen.getByRole("textbox", { name: "harga" })).toHaveFocus()
  })

  it("tidak memindahkan fokus saat button di addon diklik", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupButton onClick={onClick}>Cari</InputGroupButton>
        </InputGroupAddon>
        <InputGroupInput aria-label="query" />
      </InputGroup>
    )

    await user.click(screen.getByRole("button", { name: "Cari" }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("textbox", { name: "query" })).not.toHaveFocus()
  })
})

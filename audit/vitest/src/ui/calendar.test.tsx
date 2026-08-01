import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Calendar } from "@workspace/shadcn/ui/calendar"

describe("Calendar", () => {
  it("merender grid bulan berjalan", () => {
    render(<Calendar mode="single" />)

    const dayButtons = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("data-day"))

    expect(dayButtons.length).toBeGreaterThan(20)
  })

  it("memicu onSelect saat hari diklik", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Calendar mode="single" onSelect={onSelect} />)

    const dayButtons = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("data-day"))

    await user.click(dayButtons[10]!)

    await waitFor(() => expect(onSelect).toHaveBeenCalled())
    expect(onSelect.mock.calls[0]?.[0]).toBeInstanceOf(Date)
  })

  it("menandai hari terpilih dengan data-selected-single (controlled)", async () => {
    const user = userEvent.setup()
    function CalendarControlled() {
      const [selected, setSelected] = useState<Date | undefined>()
      return (
        <Calendar mode="single" selected={selected} onSelect={setSelected} />
      )
    }
    render(<CalendarControlled />)

    const getInsideDays = () =>
      screen
        .getAllByRole("button")
        .filter(
          (button) =>
            button.hasAttribute("data-day") &&
            !button.closest("[data-outside]") &&
            !button.closest("[data-disabled]")
        )

    const target = getInsideDays()[10]!
    const targetDay = target.getAttribute("data-day")

    await user.click(target)

    await waitFor(() => {
      const clicked = getInsideDays().find(
        (button) => button.getAttribute("data-day") === targetDay
      )
      expect(clicked).toHaveAttribute("data-selected-single")
    })
  })
})

import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/shadcn/ui/select"

const items = ["apel", "pisang", "jeruk"]

function renderSelect(onValueChange?: (value: string | null) => void) {
  return render(
    <Select onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

describe("Select", () => {
  it("membuka daftar opsi saat trigger diklik", async () => {
    const user = userEvent.setup()
    renderSelect()

    expect(screen.queryByRole("option", { name: "pisang" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("combobox"))

    expect(await screen.findByRole("option", { name: "apel" })).toBeVisible()
    expect(screen.getByRole("option", { name: "pisang" })).toBeVisible()
    expect(screen.getByRole("option", { name: "jeruk" })).toBeVisible()
  })

  it("memilih opsi dan memicu onValueChange", async () => {
    const user = userEvent.setup()
    let selected: string | null = null
    renderSelect((value) => {
      selected = value
    })

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "pisang" }))

    await waitFor(() => expect(selected).toBe("pisang"))
  })

  it("menampilkan nilai terpilih di trigger", async () => {
    const user = userEvent.setup()
    render(
      <Select defaultValue="jeruk">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )

    await waitFor(() => expect(screen.getByText("jeruk")).toBeVisible())
  })
})

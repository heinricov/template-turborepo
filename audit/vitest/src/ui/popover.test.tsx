import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "@workspace/shadcn/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/shadcn/ui/popover"

describe("Popover", () => {
  it("membuka konten saat trigger diklik", async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger render={<Button />}>Buka Info</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Detail</PopoverTitle>
            <PopoverDescription>Informasi tambahan</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    )

    expect(screen.queryByText("Detail")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Buka Info" }))

    expect(await screen.findByText("Detail")).toBeVisible()
    expect(screen.getByText("Informasi tambahan")).toBeVisible()
  })

  it("menutup konten saat tombol Escape ditekan", async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger render={<Button />}>Buka Info</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Detail</PopoverTitle>
        </PopoverContent>
      </Popover>
    )

    await user.click(screen.getByRole("button", { name: "Buka Info" }))
    await screen.findByText("Detail")

    await user.keyboard("{Escape}")

    await waitFor(() => expect(screen.queryByText("Detail")).not.toBeInTheDocument())
  })
})

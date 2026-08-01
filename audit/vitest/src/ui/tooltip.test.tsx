import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "@workspace/shadcn/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/shadcn/ui/tooltip"

describe("Tooltip", () => {
  it("menampilkan konten saat trigger di-hover", async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button />}>Simpan</TooltipTrigger>
          <TooltipContent>Menyimpan perubahan</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.queryByText("Menyimpan perubahan")).not.toBeInTheDocument()

    await user.hover(screen.getByRole("button", { name: "Simpan" }))

    expect(await screen.findByText("Menyimpan perubahan")).toBeVisible()
  })

  it("menyembunyikan konten setelah unhover", async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button />}>Simpan</TooltipTrigger>
          <TooltipContent>Menyimpan perubahan</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByRole("button", { name: "Simpan" })
    await user.hover(trigger)
    await screen.findByText("Menyimpan perubahan")

    await user.unhover(trigger)

    await waitFor(() =>
      expect(screen.queryByText("Menyimpan perubahan")).not.toBeInTheDocument()
    )
  })
})

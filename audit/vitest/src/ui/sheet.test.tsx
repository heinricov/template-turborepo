import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "@workspace/shadcn/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/shadcn/ui/sheet"

describe("Sheet", () => {
  it("membuka konten saat trigger diklik", async () => {
    const user = userEvent.setup()
    render(
      <Sheet>
        <SheetTrigger render={<Button />}>Buka Panel</SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Judul Panel</SheetTitle>
            <SheetDescription>Deskripsi panel</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )

    expect(screen.queryByText("Judul Panel")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Buka Panel" }))

    expect(await screen.findByText("Judul Panel")).toBeVisible()
  })

  it("menandai sisi (side) pada konten", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Sheet>
        <SheetTrigger render={<Button />}>Buka Panel</SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>Kiri</SheetTitle>
        </SheetContent>
      </Sheet>
    )

    await user.click(screen.getByRole("button", { name: "Buka Panel" }))

    const content = await screen.findByText("Kiri")
    expect(content.closest("[data-slot=sheet-content]")).toHaveAttribute(
      "data-side",
      "left"
    )
    expect(container).toBeInTheDocument()
  })

  it("menutup konten melalui tombol close", async () => {
    const user = userEvent.setup()
    render(
      <Sheet>
        <SheetTrigger render={<Button />}>Buka Panel</SheetTrigger>
        <SheetContent>
          <SheetTitle>Judul Panel</SheetTitle>
        </SheetContent>
      </Sheet>
    )

    await user.click(screen.getByRole("button", { name: "Buka Panel" }))
    await user.click(await screen.findByRole("button", { name: "Close" }))

    await waitFor(() =>
      expect(screen.queryByText("Judul Panel")).not.toBeInTheDocument()
    )
  })
})

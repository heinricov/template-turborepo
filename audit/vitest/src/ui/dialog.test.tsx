import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@workspace/shadcn/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/shadcn/ui/dialog"

function renderDialog(extraProps: Record<string, unknown> = {}) {
  return render(
    <Dialog {...extraProps}>
      <DialogTrigger render={<Button />}>Buka Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Judul Dialog</DialogTitle>
          <DialogDescription>Deskripsi dialog</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe("Dialog", () => {
  it("menutup konten saat belum dibuka", () => {
    renderDialog()
    expect(screen.queryByText("Judul Dialog")).not.toBeInTheDocument()
  })

  it("membuka konten saat trigger diklik", async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole("button", { name: "Buka Dialog" }))

    expect(await screen.findByText("Judul Dialog")).toBeVisible()
    expect(screen.getByText("Deskripsi dialog")).toBeVisible()
  })

  it("menutup konten melalui tombol close", async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole("button", { name: "Buka Dialog" }))
    await user.click(await screen.findByRole("button", { name: "Close" }))

    await waitFor(() =>
      expect(screen.queryByText("Judul Dialog")).not.toBeInTheDocument()
    )
  })

  it("memicu onOpenChange saat dibuka", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog({ onOpenChange })

    await user.click(screen.getByRole("button", { name: "Buka Dialog" }))

    await waitFor(() => expect(onOpenChange.mock.calls[0]?.[0]).toBe(true))
  })
})

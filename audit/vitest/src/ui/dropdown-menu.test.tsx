import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@workspace/shadcn/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/shadcn/ui/dropdown-menu"

describe("DropdownMenu", () => {
  it("membuka menu saat trigger diklik", async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Menu Aksi</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Pengaturan</DropdownMenuLabel>
            <DropdownMenuItem>Edit Profil</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Hapus Akun</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    expect(screen.queryByText("Edit Profil")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Menu Aksi" }))

    expect(await screen.findByText("Edit Profil")).toBeVisible()
    expect(screen.getByText("Hapus Akun")).toBeVisible()
  })

  it("memicu onClick item yang diklik", async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Menu Aksi</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onEdit}>Edit Profil</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    await user.click(screen.getByRole("button", { name: "Menu Aksi" }))
    await user.click(await screen.findByText("Edit Profil"))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it("menandai item destructive dengan data-variant", async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Menu Aksi</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="destructive">Hapus Akun</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    await user.click(screen.getByRole("button", { name: "Menu Aksi" }))

    const item = await screen.findByText("Hapus Akun")
    await waitFor(() =>
      expect(item.closest("[data-slot=dropdown-menu-item]")).toHaveAttribute(
        "data-variant",
        "destructive"
      )
    )
  })
})

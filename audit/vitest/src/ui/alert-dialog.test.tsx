import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "@workspace/shadcn/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/shadcn/ui/alert-dialog"

describe("AlertDialog", () => {
  it("menutup konten saat belum dibuka", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Hapus Data</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>Tindakan tidak dapat dibatalkan</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction>Ya, Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

    expect(screen.queryByText("Konfirmasi Hapus")).not.toBeInTheDocument()
  })

  it("membuka konten saat trigger diklik", async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Hapus Data</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
          <AlertDialogDescription>Tindakan tidak dapat dibatalkan</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    )

    await user.click(screen.getByRole("button", { name: "Hapus Data" }))

    expect(await screen.findByText("Konfirmasi Hapus")).toBeVisible()
    expect(screen.getByText("Tindakan tidak dapat dibatalkan")).toBeVisible()
  })

  it("menutup konten melalui tombol Batal", async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Hapus Data</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

    await user.click(screen.getByRole("button", { name: "Hapus Data" }))
    await user.click(await screen.findByRole("button", { name: "Batal" }))

    await waitFor(() =>
      expect(screen.queryByText("Konfirmasi Hapus")).not.toBeInTheDocument()
    )
  })
})

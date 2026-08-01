import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/shadcn/ui/tabs"

function renderTabs(extraProps: Record<string, unknown> = {}) {
  return render(
    <Tabs defaultValue="account" {...extraProps}>
      <TabsList>
        <TabsTrigger value="account">Akun</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Konten Akun</TabsContent>
      <TabsContent value="password">Konten Password</TabsContent>
    </Tabs>
  )
}

describe("Tabs", () => {
  it("memilih tab pertama sesuai defaultValue", () => {
    renderTabs()

    expect(screen.getByRole("tab", { name: "Akun" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute(
      "aria-selected",
      "false"
    )
  })

  it("menampilkan konten tab aktif", () => {
    renderTabs()
    expect(screen.getByText("Konten Akun")).toBeVisible()
  })

  it("berpindah tab saat trigger lain diklik", async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.click(screen.getByRole("tab", { name: "Password" }))

    expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(screen.getByRole("tab", { name: "Akun" })).toHaveAttribute(
      "aria-selected",
      "false"
    )
    await waitFor(() => expect(screen.getByText("Konten Password")).toBeVisible())
  })

  it("memicu onValueChange saat berpindah tab", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderTabs({ onValueChange })

    await user.click(screen.getByRole("tab", { name: "Password" }))

    await waitFor(() => expect(onValueChange.mock.calls[0]?.[0]).toBe("password"))
  })
})

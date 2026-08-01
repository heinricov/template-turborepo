import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/shadcn/ui/sidebar"

describe("Sidebar", () => {
  it("merender konten di dalam provider", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Navigasi utama</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText("Navigasi utama")).toBeVisible()
  })

  it("melempar error saat dipakai tanpa provider", () => {
    expect(() => render(<Sidebar>Konten</Sidebar>)).toThrow(
      "useSidebar must be used within a SidebarProvider"
    )
  })

  it("toggle mengubah state open melalui onOpenChange", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <SidebarProvider onOpenChange={onOpenChange}>
        <SidebarTrigger />
        <Sidebar>Konten</Sidebar>
      </SidebarProvider>
    )

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))

    await waitFor(() => expect(onOpenChange.mock.calls[0]?.[0]).toBe(false))
  })
})

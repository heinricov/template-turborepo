import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@workspace/shadcn/ui/button"

describe("Button", () => {
  it("merender dengan data-slot dan label aksesibel", () => {
    render(<Button>Simpan</Button>)
    const button = screen.getByRole("button", { name: "Simpan" })
    expect(button).toHaveAttribute("data-slot", "button")
  })

  it("menangani event onClick", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Klik</Button>)

    await user.click(screen.getByRole("button", { name: "Klik" }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("tidak memicu onClick saat disabled", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Klik
      </Button>
    )

    await user.click(screen.getByRole("button", { name: "Klik" }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it("menerapkan class sesuai variant", () => {
    render(<Button variant="destructive">Hapus</Button>)
    expect(screen.getByRole("button", { name: "Hapus" }).className).toContain(
      "text-destructive"
    )
  })

  it("menerapkan className tambahan", () => {
    render(
      <Button className="mt-4" variant="outline">
        Simpan
      </Button>
    )
    const button = screen.getByRole("button", { name: "Simpan" })
    expect(button.className).toContain("mt-4")
    expect(button.className).toContain("border-border")
  })
})

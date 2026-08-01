import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/shadcn/ui/avatar"

describe("Avatar", () => {
  it("merender fallback tanpa gambar", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText("AB")).toBeVisible()
    expect(screen.getByText("AB").closest("[data-slot=avatar]")).toBeInTheDocument()
  })

  it("menerapkan ukuran pada root", () => {
    const { container } = render(
      <Avatar size="lg">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )

    expect(container.querySelector("[data-slot=avatar]")).toHaveAttribute(
      "data-size",
      "lg"
    )
  })

  it("menampilkan fallback selama gambar belum dimuat", () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.png" alt="Foto" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText("AB")).toBeVisible()
    expect(screen.queryByAltText("Foto")).not.toBeInTheDocument()
  })
})

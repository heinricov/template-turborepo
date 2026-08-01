import { render, screen, waitFor } from "@testing-library/react"
import { fireEvent } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { ThemeProvider } from "@workspace/shadcn/ui/theme-provider"

describe("ThemeProvider", () => {
  beforeEach(() => {
    document.documentElement.className = ""
    localStorage.clear()
  })

  it("merender children", () => {
    render(<ThemeProvider defaultTheme="light">Konten aplikasi</ThemeProvider>)
    expect(screen.getByText("Konten aplikasi")).toBeInTheDocument()
  })

  it("mengubah tema gelap dengan hotkey 'd'", async () => {
    render(<ThemeProvider defaultTheme="light">Konten</ThemeProvider>)

    fireEvent.keyDown(window, { key: "d" })

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
  })

  it("kembali ke tema terang saat hotkey ditekan dua kali", async () => {
    render(<ThemeProvider defaultTheme="light">Konten</ThemeProvider>)

    fireEvent.keyDown(window, { key: "d" })
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))

    fireEvent.keyDown(window, { key: "d" })
    await waitFor(() => expect(document.documentElement).not.toHaveClass("dark"))
  })

  it("tidak mengubah tema saat hotkey ditekan di dalam input", async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <input aria-label="cari" />
      </ThemeProvider>
    )

    fireEvent.keyDown(screen.getByRole("textbox", { name: "cari" }), { key: "d" })

    expect(document.documentElement).not.toHaveClass("dark")
  })
})

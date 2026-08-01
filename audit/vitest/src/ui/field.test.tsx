import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Input } from "@workspace/shadcn/ui/input"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/shadcn/ui/field"

describe("Field", () => {
  it("merender label, deskripsi, dan input", () => {
    render(
      <Field>
        <FieldLabel htmlFor="nama">Nama Lengkap</FieldLabel>
        <FieldContent>
          <Input id="nama" />
          <FieldDescription>Gunakan nama sesuai KTP</FieldDescription>
        </FieldContent>
      </Field>
    )

    expect(screen.getByText("Nama Lengkap")).toHaveAttribute("data-slot", "field-label")
    expect(screen.getByText("Gunakan nama sesuai KTP")).toHaveAttribute(
      "data-slot",
      "field-description"
    )
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("menampilkan error pertama dari daftar errors", () => {
    render(<FieldError errors={[{ message: "Wajib diisi" }]} />)

    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Wajib diisi")
    expect(alert).toHaveAttribute("data-slot", "field-error")
  })

  it("menampilkan daftar error unik jika lebih dari satu", () => {
    render(
      <FieldError
        errors={[{ message: "Terlalu pendek" }, { message: "Terlalu pendek" }, { message: "Format salah" }]}
      />
    )

    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Terlalu pendek")
    expect(alert).toHaveTextContent("Format salah")
    expect(alert.querySelectorAll("li")).toHaveLength(2)
  })

  it("tidak merender apa pun tanpa error", () => {
    render(<FieldError />)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("children mengalahkan daftar errors", () => {
    render(<FieldError errors={[{ message: "Dari backend" }]}>Pesan kustom</FieldError>)

    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Pesan kustom")
    expect(alert).not.toHaveTextContent("Dari backend")
  })
})

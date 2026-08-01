import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/shadcn/ui/table"

describe("Table", () => {
  it("merender header, body, dan caption", () => {
    render(
      <Table>
        <TableCaption>Daftar pengguna</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Andi</TableCell>
            <TableCell>andi@example.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total 1 pengguna</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )

    expect(screen.getByText("Daftar pengguna")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Nama" })).toBeInTheDocument()
    expect(screen.getByText("Andi")).toBeInTheDocument()
    expect(screen.getByText("Total 1 pengguna")).toBeInTheDocument()
  })

  it("menandai sel dengan data-slot", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Sel</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByText("Sel")).toHaveAttribute("data-slot", "table-cell")
  })
})

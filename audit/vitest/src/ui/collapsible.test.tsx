import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "@workspace/shadcn/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/shadcn/ui/collapsible"

describe("Collapsible", () => {
  it("menyembunyikan konten saat tertutup", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger render={<Button />}>Detail</CollapsibleTrigger>
        <CollapsibleContent>Isi tersembunyi</CollapsibleContent>
      </Collapsible>
    )

    expect(screen.queryByText("Isi tersembunyi")).not.toBeInTheDocument()
  })

  it("menampilkan konten saat trigger diklik", async () => {
    const user = userEvent.setup()
    render(
      <Collapsible>
        <CollapsibleTrigger render={<Button />}>Detail</CollapsibleTrigger>
        <CollapsibleContent>Isi tersembunyi</CollapsibleContent>
      </Collapsible>
    )

    await user.click(screen.getByRole("button", { name: "Detail" }))

    expect(await screen.findByText("Isi tersembunyi")).toBeVisible()
  })
})

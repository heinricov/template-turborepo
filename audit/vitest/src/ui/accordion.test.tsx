// File uji otomatis dari `pnpm morea unitest create` — sesuaikan sesuai kebutuhan.

import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/shadcn/ui/accordion"

describe("Accordion", () => {
  it("merender dengan data-slot: accordion", () => {
    const { container } = render(<Accordion />)
    expect(
      container.querySelector('[data-slot="accordion"]')
    ).toBeInTheDocument()
  })

  it("menerapkan className tambahan", () => {
    const { container } = render(<Accordion className="mt-4" />)
    expect(container.querySelector('[data-slot="accordion"]')).toHaveClass(
      "mt-4"
    )
  })
})

describe("AccordionItem", () => {
  it("merender dengan data-slot: accordion-item", () => {
    const { container } = render(
      <Accordion>
        <AccordionItem />
      </Accordion>
    )
    expect(
      container.querySelector('[data-slot="accordion-item"]')
    ).toBeInTheDocument()
  })

  it("menerapkan className tambahan", () => {
    const { container } = render(
      <Accordion>
        <AccordionItem className="mt-4" />
      </Accordion>
    )
    expect(container.querySelector('[data-slot="accordion-item"]')).toHaveClass(
      "mt-4"
    )
  })
})

describe("AccordionTrigger", () => {
  it("merender dengan data-slot: accordion-trigger", () => {
    const { container } = render(
      <Accordion>
        <AccordionItem>
          <AccordionTrigger />
        </AccordionItem>
      </Accordion>
    )
    expect(
      container.querySelector('[data-slot="accordion-trigger"]')
    ).toBeInTheDocument()
  })

  it("menerapkan className tambahan", () => {
    const { container } = render(
      <Accordion>
        <AccordionItem>
          <AccordionTrigger className="mt-4" />
        </AccordionItem>
      </Accordion>
    )
    expect(
      container.querySelector('[data-slot="accordion-trigger"]')
    ).toHaveClass("mt-4")
  })
})

describe("AccordionContent", () => {
  it.todo("merender saat item/dialog terbuka")

  // Konten hanya dirender saat terbuka (default tertutup) — contoh:
  // it("merender saat terbuka", () => {
  //   const { container } = render(<Accordion><AccordionItem><AccordionContent /></AccordionItem></Accordion>)
  //   expect(container.querySelector('[data-slot="accordion-content"]')).toBeInTheDocument()
  // })
})

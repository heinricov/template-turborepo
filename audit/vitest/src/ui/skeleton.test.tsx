import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Skeleton } from "@workspace/shadcn/ui/skeleton"

describe("Skeleton", () => {
  it("merender elemen placeholder", () => {
    const { container } = render(<Skeleton className="h-10 w-full" />)

    const skeleton = container.querySelector("[data-slot=skeleton]")
    expect(skeleton).not.toBeNull()
    expect(skeleton!.className).toContain("h-10")
  })
})

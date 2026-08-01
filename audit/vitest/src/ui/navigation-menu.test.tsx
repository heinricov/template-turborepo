import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "@workspace/shadcn/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@workspace/shadcn/ui/navigation-menu"

describe("NavigationMenu", () => {
  it("merender daftar navigasi dengan link", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" data-active>
              Beranda
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )

    expect(screen.getByRole("link", { name: "Beranda" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Beranda" })).toHaveAttribute(
      "data-slot",
      "navigation-menu-link"
    )
  })

  it("membuka konten saat trigger di-hover", async () => {
    const user = userEvent.setup()
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Produk</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#">Detail Produk</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )

    await user.hover(screen.getByRole("button", { name: "Produk" }))

    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Detail Produk" })).toBeVisible()
    )
  })
})

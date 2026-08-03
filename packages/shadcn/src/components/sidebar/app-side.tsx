"use client"

import type { LucideIcon } from "lucide-react"

import { NavMain } from "./nav-main"
import { NavCollaps } from "./nav-collaps"
import { SidebarBrand } from "./sidebar-brand"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/shadcn/ui/sidebar"

type NavMainItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  badge?: string
}

type NavCollapsItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  badge?: string
  items?: { title: string; url: string; isActive?: boolean; badge?: string }[]
}

type AppSidebarMenu = {
  NavMain?: { title?: string; items?: NavMainItem[] }
  NavCollaps?: { title?: string; items?: NavCollapsItem[] }
}

type AppSidebarBrand = {
  name: string
  logo?: LucideIcon
  description?: string
}

export function AppSidebar({
  menu,
  brand,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  menu?: AppSidebarMenu
  brand?: AppSidebarBrand
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{brand && <SidebarBrand {...brand} />}</SidebarHeader>
      <SidebarContent>
        {menu?.NavMain?.items?.length ? (
          <NavMain title={menu.NavMain.title} items={menu.NavMain.items} />
        ) : null}
        {menu?.NavCollaps?.items?.length ? (
          <NavCollaps
            title={menu.NavCollaps.title}
            items={menu.NavCollaps.items}
          />
        ) : null}
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        Version 1.0.0
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

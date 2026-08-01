import type { ComponentProps } from "react"
import { AppSidebar } from "./app-side"
import { HeaderSide } from "./header-side"
import { SidebarInset, SidebarProvider } from "@workspace/shadcn/ui/sidebar"

import { TooltipProvider } from "@workspace/shadcn/ui/tooltip"

import type { BreadcrumbItemType } from "./breadcrumb-side"

export default function LayoutSide({
  children,
  menu,
  user,
  brand,
  breadcrumb,
  onLogout,
}: {
  children: React.ReactNode
  menu?: ComponentProps<typeof AppSidebar>["menu"]
  user?: {
    name: string
    email: string
    avatar?: string
  } | null
  brand?: ComponentProps<typeof AppSidebar>["brand"]
  breadcrumb?: BreadcrumbItemType[]
  onLogout?: () => void
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar menu={menu} brand={brand} />
        <SidebarInset>
          <HeaderSide breadcrumb={breadcrumb} user={user} onLogout={onLogout} />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

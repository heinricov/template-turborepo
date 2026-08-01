"use client"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@workspace/shadcn/ui/sidebar"
import type { LucideIcon } from "lucide-react"

type SidebarBrandProps = {
  name: string
  logo?: LucideIcon
  description?: string
}

export function SidebarBrand({ name, logo: Logo, description }: SidebarBrandProps) {
  return (
    
<SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" >
              {Logo && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Logo className="size-4" />
        </div>
      )}
      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-semibold">{name}</span>
        {description && (
          <span className="truncate text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
  )
}

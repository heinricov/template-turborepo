"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/shadcn/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/shadcn/ui/sidebar"

export type NavCollapsSubItem = {
  title: string
  url: string
  isActive?: boolean
  badge?: string
}

export type NavCollapsItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  badge?: string
  items?: NavCollapsSubItem[]
}

export function NavCollaps({
  title,
  items,
}: {
  title?: string
  items: NavCollapsItem[]
}) {
  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="group/collapsible"
                  />
                }
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.badge ? (
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                ) : null}
                <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-panel-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        href={subItem.url}
                        isActive={subItem.isActive}
                      >
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                      {subItem.badge ? (
                        <SidebarMenuBadge>{subItem.badge}</SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

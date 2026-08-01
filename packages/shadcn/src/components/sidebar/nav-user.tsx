"use client"

import { ChevronsUpDown, type LucideIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/shadcn/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/shadcn/ui/dropdown-menu"
import { Button } from "@workspace/shadcn/ui/button"

export type NavUserItem = {
  label: string
  icon?: LucideIcon
  onClick?: () => void
}

export function NavUser({
  user,
  onLogout,
}: {
  user?: {
    name: string
    email: string
    avatar?: string
  } | null
  menuItems?: NavUserItem[]
  onLogout?: () => void
}) {
  const initials = (user?.name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 gap-2 rounded-full px-1.5"
            aria-label="User menu"
          />
        }
      >
        <Avatar className="size-8 rounded-full">
          <AvatarImage src={user?.avatar ?? ""} alt={user?.name ?? ""} />
          <AvatarFallback className="rounded-full">{initials || "?"}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium md:block">{user?.name ?? ""}</span>
        <ChevronsUpDown className="hidden size-4 text-muted-foreground md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-lg">
        
       <DropdownMenuContent sideOffset={8} align="end" className="w-52">
        <DropdownMenuGroup>
          {user && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-full">
                  <AvatarImage src={user.avatar ?? ""} alt={user.name} />
                  <AvatarFallback className="rounded-full">{initials || "?"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
        )}
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          {onLogout && (
        <>
        <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onLogout}>Log out</DropdownMenuItem>
        </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
        
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, FilePenLine, MoreHorizontal, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/shadcn/ui/dropdown-menu"

export function actionsColumn<TData>(
  onView?: (id: string) => void,
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void
): ColumnDef<TData> {
  return {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    size: 80,
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original as Record<string, unknown>

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0 text-xs/relaxed font-medium outline-none transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              }
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onView?.(String(item.id ?? ""))}>
                  <Eye className="size-3.5" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(String(item.id ?? ""))}>
                  <FilePenLine className="size-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete?.(String(item.id ?? ""))}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  }
}

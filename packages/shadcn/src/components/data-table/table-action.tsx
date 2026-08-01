"use client"

import type { Table } from "@tanstack/react-table"
import { ChevronDown, FileSpreadsheet, Trash2 } from "lucide-react"

import { Button } from "@workspace/shadcn/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/shadcn/ui/dropdown-menu"
import { Input } from "@workspace/shadcn/ui/input"

export function TableAction<TData>({
  table,
  showFilter,
  filterPlaceholderText,
  filterValue,
  onFilterChange,
  filterDescriptionText,
  rowSelection,
}: {
  table: Table<TData>
  showFilter: boolean
  filterPlaceholderText: string
  filterValue: string
  onFilterChange: (value: string) => void
  filterDescriptionText: string | null
  rowSelection: Record<string, boolean>
}) {
  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="flex items-center justify-between gap-2 ">
      {/* Filter */}
      <div className="flex flex-col gap-2">
        {showFilter && (
          <Input
            placeholder={filterPlaceholderText}
            value={filterValue}
            onChange={(event) => onFilterChange(event.target.value)}
            className="w-72"
          />
        )}
        {filterDescriptionText && (
          <p className="mt-1.5 ml-1 text-xs text-muted-foreground">
            {filterDescriptionText}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 bg-muted/30 px-4 py-2">
            <div className="ml-auto flex items-center gap-1">
              <p className="text-xs text-muted-foreground">
                {selectedCount} selected
              </p>
              <Button variant="outline" size="sm">
                <Trash2 className="size-3.5" />
                Delete
              </Button>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="size-3.5" />
                Export Excel
              </Button>
            </div>
          </div>
        )}

        {/* Columns */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border border-border px-2 text-xs/relaxed font-medium outline-none transition-all hover:bg-input/50 hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            }
          >
            Columns <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

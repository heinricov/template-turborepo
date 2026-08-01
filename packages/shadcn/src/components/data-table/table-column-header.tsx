"use client"

import * as React from "react"
import { ArrowDownUp, Filter } from "lucide-react"

import { Checkbox } from "@workspace/shadcn/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/shadcn/ui/dropdown-menu"
import type { HeaderAction } from "./data-table"

export function ColumnHeader({
  label,
  columnId,
  column,
  table,
  headerAction,
}: {
  label: string
  columnId: string
  column: {
    toggleSorting: (desc?: boolean) => void
    getIsSorted: () => "asc" | "desc" | false
    getFilterValue: () => unknown
    setFilterValue: (value: unknown) => void
  }
  table: { getCoreRowModel: () => { rows: { getValue: (key: string) => unknown }[] } }
  headerAction: HeaderAction
}) {
  const [open, setOpen] = React.useState(false)

  const uniqueValues = React.useMemo(() => {
    const vals = new Set<string>()
    for (const row of table.getCoreRowModel().rows) {
      vals.add(String(row.getValue(columnId) ?? ""))
    }
    return [...vals].sort()
  }, [table, columnId])

  const excluded = (column.getFilterValue() as string[]) ?? []
  const sorted = column.getIsSorted()

  const toggleFilterValue = (value: string) => {
    if (excluded.includes(value)) {
      column.setFilterValue(excluded.filter((v) => v !== value))
    } else {
      column.setFilterValue([...excluded, value])
    }
  }

  const icon =
    headerAction === "filter" ? (
      <Filter className="size-3.5 text-muted-foreground" />
    ) : (
      <ArrowDownUp className="size-3.5 text-muted-foreground" />
    )

  return (
    <div className="flex w-full items-center justify-between gap-1">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="group inline-flex items-center gap-1 text-xs font-medium outline-none hover:text-foreground"
            />
          }
        >
          {label}
          {icon}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {headerAction === "filter" && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Filter {label}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-48 overflow-auto">
                {uniqueValues.map((value) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFilterValue(value)
                    }}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      checked={!excluded.includes(value)}
                      aria-label={value}
                      className="pointer-events-none"
                    />
                    <span className="text-xs">{value || "(empty)"}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </>
          )}
          {headerAction === "SortAtoZ" && (
            <>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowDownUp className="size-3.5" />
                <span>Sort A → Z</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDownUp className="size-3.5" />
                <span>Sort Z → A</span>
              </DropdownMenuItem>
            </>
          )}
          {headerAction === "Sort1to9" && (
            <>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowDownUp className="size-3.5" />
                <span>Sort 1 → 9</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDownUp className="size-3.5" />
                <span>Sort 9 → 1</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {headerAction !== "filter" && sorted && (
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
          {sorted === "asc" ? "↑" : "↓"}
        </span>
      )}
      {excluded.length > 0 && headerAction === "filter" && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded bg-primary px-1 text-[10px] text-primary-foreground">
          {excluded.length}
        </span>
      )}
    </div>
  )
}

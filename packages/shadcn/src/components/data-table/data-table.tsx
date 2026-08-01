/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@workspace/shadcn/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/shadcn/ui/table"
import { ColumnHeader } from "./table-column-header"
import { TableAction } from "./table-action"
import { actionsColumn } from "./table-actions-column"
import { selectColumn } from "./table-select-column"
import { TablePagination } from "./table-pagination"
export type ColumnType =
  | "text"
  | "number"
  | "currencyIDR"
  | "currencyUSD"
  | "email"
  | "datetime"
  | "date"
  | "time"

export type HeaderAction = "filter" | "SortAtoZ" | "Sort1to9"

export interface SimpleColumn<TData> {
  key: string & keyof TData
  header?: string
  type?: ColumnType
  headerAction?: HeaderAction
}

export type DataTableColumn<TData> =
  | SimpleColumn<TData>
  | ColumnDef<TData>

function isSimpleColumn<TData>(
  col: DataTableColumn<TData>
): col is SimpleColumn<TData> {
  return "key" in col && !("accessorKey" in col) && !("id" in col)
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

function formatValue(value: unknown, type: ColumnType): string {
  if (value == null) return ""

  switch (type) {
    case "number":
      return new Intl.NumberFormat("en-US").format(Number(value))

    case "currencyUSD":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(value))

    case "currencyIDR":
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(value))

    case "email":
      return String(value).toLowerCase()

    case "datetime":
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(String(value)))

    case "date":
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(String(value)))

    case "time":
      return new Intl.DateTimeFormat("en-US", {
        timeStyle: "short",
      }).format(new Date(String(value)))

    default:
      return String(value)
  }
}

function toColumnDef<TData>(col: DataTableColumn<TData>): ColumnDef<TData> {
  if (isSimpleColumn(col)) {
    const type = col.type ?? "text"
    const label = col.header ?? formatKey(col.key as string)
    const headerAction = col.headerAction

    return {
      accessorKey: col.key as string,
      ...(headerAction === "filter" && {
        filterFn: (
          row: { getValue: (key: string) => unknown },
          _columnId: string,
          filterValue: string[]
        ) => {
          if (!filterValue || filterValue.length === 0) return true
          return !filterValue.includes(String(row.getValue(col.key as string)))
        },
      }),
      header: headerAction
        ? ({ column, table }) => (
            <ColumnHeader
              label={label}
              columnId={col.key as string}
              column={column}
              table={table}
              headerAction={headerAction}
            />
          )
        : label,
      cell: ({ row }) => {
        const value = row.getValue(col.key as string)
        return <div>{formatValue(value, type)}</div>
      },
    }
  }
  return col
}

export interface DataTableProps<TData, TValue = unknown> {
  data: TData[]
  columns: DataTableColumn<TData>[]
  action?: boolean
  filterColumn?: boolean | string | string[]
  filterPlaceholder?: string
  filterDescription?: string
  rowPagination?: 5 | 10 | 15 | 20
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function DataTable<TData, TValue = unknown>({
  data,
  columns,
  action = true,
  filterColumn,
  filterPlaceholder,
  filterDescription,
  rowPagination = 10,
  onView,
  onEdit,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const resolvedColumns = React.useMemo(
    () => columns.map(toColumnDef),
    [columns]
  )

  const mergedColumns = React.useMemo(
    () => [
      ...(action ? [selectColumn<TData>()] : []),
      ...resolvedColumns,
      ...(action ? [actionsColumn<TData>(onView, onEdit, onDelete)] : []),
    ],
    [resolvedColumns, onView, onEdit, onDelete, action]
  )

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const filterTargets = React.useMemo(() => {
    if (filterColumn === true || filterColumn === false || filterColumn === undefined) return null
    if (Array.isArray(filterColumn)) return filterColumn
    return [filterColumn]
  }, [filterColumn])

  const showFilter = filterColumn !== undefined

  const table = useReactTable({
    data,
    columns: mergedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: rowPagination,
      },
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })

  const [filterValue, setFilterValue] = React.useState("")

  const handleFilterChange = React.useCallback(
    (value: string) => {
      setFilterValue(value)
      if (!filterTargets) {
        setGlobalFilter(value)
      } else {
        for (const id of filterTargets) {
          table.getColumn(id)?.setFilterValue(value)
        }
      }
    },
    [filterTargets, table]
  )

  const filterPlaceholderText = React.useMemo(() => {
    if (filterPlaceholder) return filterPlaceholder
    if (filterColumn === true) return "Search all columns..."
    if (Array.isArray(filterColumn)) return "Filter..."
    if (typeof filterColumn === "string") return `Filter ${filterColumn}...`
    return ""
  }, [filterColumn, filterPlaceholder])

  const filterDescriptionText = React.useMemo(() => {
    if (filterDescription) return filterDescription
    if (!showFilter) return null
    if (filterColumn === true) return "Searching across all columns"
    if (Array.isArray(filterColumn)) return `Filtering by ${filterColumn.join(", ")}`
    if (typeof filterColumn === "string") return `Filtering by ${filterColumn}`
    return null
  }, [filterColumn, filterDescription, showFilter])

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      {/* Filter & Columns */}
      <TableAction
        table={table}
        showFilter={showFilter}
        filterPlaceholderText={filterPlaceholderText}
        filterValue={filterValue}
        onFilterChange={handleFilterChange}
        filterDescriptionText={filterDescriptionText}
        rowSelection={rowSelection}
      />
      {/* Table */}
      <div className="mt-4 mb-4">
        <Table className="table-fixed ">
          <colgroup>
            {mergedColumns.map((col, i) => (
              <col
                key={col.id ?? i}
                className={
                  col.id === "select"
                    ? "w-12.5"
                    : col.id === "actions"
                      ? "w-20"
                      : undefined
                }
              />
            ))}
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-10 border bg-muted/50 px-3 text-xs font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="border px-3 py-2 text-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={mergedColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <TablePagination table={table} />
    </div>
  )
}

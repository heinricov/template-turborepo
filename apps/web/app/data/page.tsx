import DataTable, {
  type SimpleColumn,
} from "@workspace/shadcn/components/data-table"

type User = {
  id: string
  email: string
  username: string | null
  status: string
  role: string
  createdAt: string
  updatedAt: string
}

const API_URL = process.env.API_URL ?? "http://localhost:4000"

const columns: SimpleColumn<User>[] = [
  { key: "email", type: "email", headerAction: "SortAtoZ" },
  { key: "username" },
  { key: "status", headerAction: "filter" },
  { key: "role", headerAction: "filter" },
  {
    key: "createdAt",
    header: "Created",
    type: "datetime",
    headerAction: "Sort1to9",
  },
]

export default async function Page() {
  let users: User[] = []
  let error: string | null = null

  try {
    const res = await fetch(`${API_URL}/users`, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    users = (await res.json()) as User[]
  } catch {
    error = "Could not load users. Is the API running?"
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="w-full max-w-5xl">
        {error ? (
          <p className="text-muted-foreground text-sm">{error}</p>
        ) : (
          <DataTable
            data={users}
            columns={columns}
            filterColumn
            rowPagination={5}
            action={false}
          />
        )}
      </div>
    </div>
  )
}

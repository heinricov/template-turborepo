import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import DataTable, { type SimpleColumn } from "@workspace/shadcn/components/data-table"
import { apiFetch } from "@workspace/shadcn/lib/api"
import { authFetch } from "@/lib/api"

type User = {
  id: string
  email: string
  username: string | null
  status: string
  role: string
  createdAt: string
  updatedAt: string
}

const columns: SimpleColumn<User>[] = [
  { key: "email", type: "email", headerAction: "SortAtoZ" },
  { key: "username" },
  { key: "status", headerAction: "filter" },
  { key: "role", headerAction: "filter" },
  { key: "createdAt", header: "Created", type: "datetime", headerAction: "Sort1to9" },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<User[]>("/api/users")
      .then((users) => {
        setData(users)
        setLoading(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Gagal memuat data user")
        setLoading(false)
      })
  }, [])

  const handleView = useCallback((id: string) => {
    navigate(`/users/${id}`)
  }, [navigate])

  const handleEdit = useCallback((id: string) => {
    navigate(`/users/${id}?edit=true`)
  }, [navigate])

  const handleDelete = useCallback(async (id: string) => {
    await authFetch<void>(`/api/users/${id}`, { method: "DELETE" })
    setData((prev) => prev.filter((user) => user.id !== id))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
        <DataTable 
          onView={handleView} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          data={data} 
          columns={columns} 
          rowPagination={5} 
          filterColumn 
        />
    </div>
  )
}

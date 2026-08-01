import { useCallback, useEffect, useState } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@workspace/shadcn/ui/button"
import DataForm, { type DataFormField } from "@workspace/shadcn/components/data-form"
import { apiFetch } from "@workspace/shadcn/lib/api"
import { authFetch } from "@/lib/api"

type UserDetail = {
  id: string
  email: string
  username: string | null
  status: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEdit = searchParams.get("edit") === "true"

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!id) return
    apiFetch<UserDetail>(`/api/users/${id}`)
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const fields: DataFormField[] = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "user@example.com",
      required: true,
      defaultValue: user?.email,
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "johndoe",
      required: false,
      defaultValue: user?.username ?? "",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "Select role",
      required: true,
      defaultValue: user?.role,
      options: [
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select status",
      required: true,
      defaultValue: user?.status,
      options: [
        { value: "register", label: "Register" },
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
      ],
    },
  ]

  if (isEdit) {
    fields.push({
      name: "password",
      label: "New Password",
      type: "password",
      placeholder: "Leave empty to keep current",
      required: false,
    })
  }

  const handleSubmit = useCallback(async (data: Record<string, unknown>) => {
    setMessage(null)
    try {
      const payload: Record<string, unknown> = {}
      if (data.username !== user?.username) payload.username = data.username
      if (data.role !== user?.role) payload.role = data.role
      if (data.status !== user?.status) payload.status = data.status
      if (data.password && typeof data.password === "string" && data.password.length > 0) {
        payload.password = data.password
      }

      const updated = await authFetch<UserDetail>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      setUser(updated)
      setMessage({ type: "success", text: "User berhasil diperbarui" })
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Gagal memperbarui user",
      })
    }
  }, [id, user])

  const handleCancel = useCallback(() => {
    navigate("/dashboard")
  }, [navigate])

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const handleEdit = useCallback(() => {
    navigate(`/users/${id}?edit=true`)
  }, [navigate, id])

  if (loading) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Loading...</h1>
        <p className="text-muted-foreground">Fetching user data...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold">User Not Found</h1>
        <p className="text-muted-foreground">The requested user does not exist.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">
        {isEdit ? "Edit User" : "User Detail"}
      </h1>

      {message && (
        <div
          className={`mb-4 rounded-md px-4 py-2 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <DataForm
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        cancelLabel="Back"
        onCancel={handleCancel}
        layoutCol={2}
        widthForm="2xl"
        disabled={!isEdit}
      />

      {!isEdit && (
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button type="button" onClick={handleEdit}>
            Edit
          </Button>
        </div>
      )}
    </div>
  )
}

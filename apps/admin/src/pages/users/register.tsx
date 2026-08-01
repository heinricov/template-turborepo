import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import DataForm, { type DataFormField } from "@workspace/shadcn/components/data-form"

export default function UsersRegisterPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fields: DataFormField[] = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "user@example.com",
      required: true,
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "johndoe",
      required: false,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Minimal 8 karakter",
      required: true,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "Select role",
      required: true,
      options: [
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" },
      ],
    },
  ]

  const handleSubmit = useCallback(async (data: Record<string, unknown>) => {
    setMessage(null)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? "Gagal mendaftarkan user")
      }

      setMessage({ type: "success", text: "User berhasil didaftarkan" })
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Gagal mendaftarkan user",
      })
    }
  }, [])

  const handleCancel = useCallback(() => {
    navigate("/users")
  }, [navigate])

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Register User</h1>

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
        submitLabel="Register"
        cancelLabel="Cancel"
        onCancel={handleCancel}
        layoutCol={2}
        widthForm="2xl"
      />
    </div>
  )
}

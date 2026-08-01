import { ShieldCheck } from "lucide-react"
import {
  Login,
  type LoginData,
  type LoginResult,
} from "@workspace/shadcn/components/auth/login"

export default function LoginPage({
  onLogin,
}: {
  onLogin: (result: LoginResult) => void
}) {
  const handleSubmit = async (data: LoginData) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const body: unknown = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(
        (body as { message?: string } | null)?.message ?? "Login failed",
      )
    }

    onLogin(body as LoginResult)
  }

  return (
    <Login
      logo={ShieldCheck}
      title="Admin Panel"
      description="Portal Management System for Admins role only" 
      submitLabel="Login"
      onLogin={handleSubmit}
    />
  )
}

"use client"

import { useRouter } from "next/navigation"
import {
  Login,
  type LoginData,
  type LoginResult,
} from "@workspace/shadcn/components/auth/login"
import { setStoredAuth } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (data: LoginData) => {
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

    setStoredAuth(body as LoginResult)
    router.push("/")
  }

  return (
    <Login
      title="Welcome back"
      description="Sign in to your account"
      submitLabel="Login"
      onLogin={handleLogin}
    />
  )
}

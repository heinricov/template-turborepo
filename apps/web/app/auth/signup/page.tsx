"use client"

import { useRouter } from "next/navigation"
import {
  Signup,
  type SignupData,
} from "@workspace/shadcn/components/auth/signup"

export default function SignupPage() {
  const router = useRouter()

  const handleSignup = async (data: SignupData) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role: "user" }),
    })

    const body: unknown = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(
        (body as { message?: string } | null)?.message ?? "Sign up failed",
      )
    }

    router.push("/auth/login")
  }

  return (
    <Signup
      title="Create your account"
      description="Join with your email and username"
      submitLabel="Sign Up"
      onSignup={handleSignup}
    />
  )
}

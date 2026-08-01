"use client"

import { useState } from "react"
import { z } from "zod"
import type { LucideIcon } from "lucide-react"
import { Button } from "@workspace/shadcn/ui/button"
import { Field, FieldError, FieldLabel } from "@workspace/shadcn/ui/field"
import { Input } from "@workspace/shadcn/ui/input"

const formSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormErrors = Partial<Record<keyof z.infer<typeof formSchema>, string>>

export type SignupData = {
  username: string
  email: string
  password: string
}

export function Signup({
  logo: Logo,
  title,
  description,
  submitLabel = "Create Account",
  loginHref = "/auth/login",
  onSignup,
}: {
  logo?: LucideIcon
  title?: string
  description?: string
  submitLabel?: string
  loginHref?: string
  onSignup: (data: SignupData) => Promise<unknown>
}) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = formSchema.safeParse({
      username,
      email,
      password,
      confirmPassword,
    })

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setApiError(null)
    setLoading(true)

    try {
      await onSignup({ username, email, password })
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Sign up failed",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative w-full max-w-sm overflow-hidden rounded-xl border bg-linear-to-b from-muted/50 to-card px-8 py-8 shadow-lg/5 dark:from-transparent dark:shadow-xl">
        <div
          className="absolute inset-0 -top-px -left-px z-0"
          style={{
            backgroundImage: `
        linear-gradient(to right, color-mix(in srgb, var(--card-foreground) 8%, transparent) 1px, transparent 1px),
        linear-gradient(to bottom, color-mix(in srgb, var(--card-foreground) 8%, transparent) 1px, transparent 1px)
      `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            maskImage: `
        repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 50% at 50% 0%, #000 60%, transparent 100%)
      `,
            WebkitMaskImage: `
 repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 50% at 50% 0%, #000 60%, transparent 100%)
      `,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        <div className="relative isolate flex flex-col items-center">
          {(Logo || title || description) && (
            <div className="mb-6 flex w-full flex-col items-center gap-2 text-center">
              {Logo && (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Logo className="size-6" />
                </div>
              )}
              {title && <h1 className="text-xl font-semibold">{title}</h1>}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          <form className="w-full space-y-6" onSubmit={onSubmit}>
            {apiError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {apiError}
              </p>
            )}
            <Field data-invalid={!!errors.username}>
              <FieldLabel>Username</FieldLabel>
              <Input
                aria-invalid={!!errors.username}
                className="w-full"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (errors.username) clearError("username")
                }}
              />
              <FieldError
                errors={errors.username ? [{ message: errors.username }] : []}
              />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel>Email</FieldLabel>
              <Input
                aria-invalid={!!errors.email}
                className="w-full"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) clearError("email")
                }}
              />
              <FieldError
                errors={errors.email ? [{ message: errors.email }] : []}
              />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel>Password</FieldLabel>
              <Input
                aria-invalid={!!errors.password}
                className="w-full"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) clearError("password")
                }}
              />
              <FieldError
                errors={errors.password ? [{ message: errors.password }] : []}
              />
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel>Confirm Password</FieldLabel>
              <Input
                aria-invalid={!!errors.confirmPassword}
                className="w-full"
                placeholder="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) clearError("confirmPassword")
                }}
              />
              <FieldError
                errors={
                  errors.confirmPassword
                    ? [{ message: errors.confirmPassword }]
                    : []
                }
              />
            </Field>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating account..." : submitLabel}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm">
            Already have an account?
            <a className="ml-1 text-muted-foreground underline" href={loginHref}>
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

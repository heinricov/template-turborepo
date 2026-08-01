import { z } from "zod"

export const roleSchema = z.enum(["user", "admin"], {
  message: "Role harus user atau admin",
})

export const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .optional(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter"),
  role: roleSchema,
})

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
})

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .optional(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter")
    .optional(),
  status: z.string().min(1, "Status tidak boleh kosong").optional(),
  role: roleSchema.optional(),
})

export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  username: z.string().nullable(),
  password: z.string(),
  status: z.string(),
  role: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type User = z.infer<typeof userSchema>

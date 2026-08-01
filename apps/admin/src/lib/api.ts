import { apiFetch, type ApiFetchOptions } from "@workspace/shadcn/lib/api"

const AUTH_KEY = "admin_auth"

type StoredAuth = {
  token: string
} | null

function getToken(): string | null {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY) ?? "null") as StoredAuth
    return auth?.token ?? null
  } catch {
    return null
  }
}

export async function authFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return apiFetch<T>(path, { ...options, token: getToken() })
}

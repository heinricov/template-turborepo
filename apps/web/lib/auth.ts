export type AuthUser = {
  id: string
  email: string
  username: string | null
  status: string
  role: string
  createdAt: string
  updatedAt: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

const STORAGE_KEY = "web.auth.session"
export const AUTH_EVENT = "web:auth-change"

export function getStoredAuth(): AuthSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function setStoredAuth(session: AuthSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function clearStoredAuth() {
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

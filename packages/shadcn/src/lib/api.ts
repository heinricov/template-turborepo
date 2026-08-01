export type ApiError = {
  message?: string
  statusCode?: number
}

export type ApiFetchOptions = RequestInit & {
  token?: string | null
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options

  const res = await fetch(path, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const body = (await res.json().catch(() => null)) as T | ApiError | null

  if (!res.ok) {
    const message = (body as ApiError | null)?.message ?? `HTTP ${res.status}`
    throw new Error(message)
  }

  return body as T
}

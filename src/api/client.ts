const BASE_URL = '/api'

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

function getHeaders(extra?: HeadersInit): HeadersInit {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: getHeaders(options.headers),
  })

  const json = await res.json()

  if (!json.success) {
    throw new ApiError(json.message || '오류가 발생했습니다', res.status)
  }

  return json
}

// success 필드 없는 raw 응답용 (알림 등)
async function rawRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: getHeaders(options.headers),
  })
  return res.json()
}

export const api = {
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),

  rawGet: <T>(path: string) =>
    rawRequest<T>(path, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
}

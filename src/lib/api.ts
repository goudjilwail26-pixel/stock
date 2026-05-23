const BASE = ''

function getToken(): string | null {
  return localStorage.getItem('stokiloo_token')
}

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  return fetch(`${BASE}${path}`, { ...options, headers })
}

import { expireSession, getCsrfToken } from './authApi'

const API_ROOT = import.meta.env.VITE_AUTH_API_ROOT ?? ''

async function request(path, options = {}) {
  const method = options.method ?? 'GET'
  const token = method === 'GET' ? null : await getCsrfToken()
  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-CSRF-TOKEN': token } : {}),
    },
    ...options,
  })

  if (response.status === 401) {
    expireSession()
    throw new Error('Oturum süresi doldu.')
  }
  if (!response.ok) throw new Error(`Aktivite kaydı isteği başarısız (${response.status}).`)
  return response.status === 204 ? null : response.json()
}

export function createActivityLog(activity) {
  return request('/api/activity-logs', {
    method: 'POST',
    body: JSON.stringify(activity),
  })
}

export function getActivityLogs(filters, signal) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) params.set(key, value)
  })
  return request(`/api/activity-logs?${params}`, { signal })
}

import { expireSession, getCsrfToken } from './authApi'

const API_ROOT = import.meta.env.VITE_AUTH_API_ROOT ?? ''

async function requestJson(path, options = {}) {
  const method = options.method ?? 'GET'
  const headers = method === 'GET'
    ? {}
    : { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': await getCsrfToken() }
  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...headers, ...options.headers },
  })

  if (response.status === 401) {
    expireSession()
    throw new Error('Session expired.')
  }

  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new Error(problem?.detail ?? `API request failed (${response.status})`)
  }

  return response.json()
}

export function listScenarios() {
  return requestJson('/api/scenarios')
}

export function createScenario(scenario) {
  return requestJson('/api/scenarios', {
    method: 'POST',
    body: JSON.stringify(scenario),
  })
}

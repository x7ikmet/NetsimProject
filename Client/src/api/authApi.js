const AUTH_API_ROOT = import.meta.env.VITE_AUTH_API_ROOT ?? ''

function endpoint(path) {
  return `${AUTH_API_ROOT}${path}`
}

export async function login(username, password) {
  const response = await fetch(endpoint('/auth/login'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Invalid username or password.'
        : 'Login failed.',
    )
  }
}

export async function getCurrentUser() {
  const response = await fetch(endpoint('/auth/me'),{
    credentials: 'include',
  })
  if (response.status === 401) {
    return null
  }
  if (!response.ok) {
    throw new Error('Could not load the current user.')
  }
  return response.json()
}


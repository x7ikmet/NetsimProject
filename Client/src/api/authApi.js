const AUTH_API_ROOT = import.meta.env.VITE_AUTH_API_ROOT ?? ''
let csrfToken = null

function endpoint(path) {
  return `${AUTH_API_ROOT}${path}`
}

export async function login(username, password) {
  csrfToken = null

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

async function getCsrfToken() {
  if (csrfToken) return csrfToken

  const response = await fetch(endpoint('/auth/csrf'), {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not prepare the secure request.')
  }

  const result = await response.json()

  if (!result.token) {
    throw new Error('The secure request token is missing.')
  }

  csrfToken = result.token
  return csrfToken
}

export async function getCurrentUser() {
  const response = await fetch(endpoint('/auth/me'), {
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

export async function logout() {
  const token = await getCsrfToken()
  const response = await fetch(endpoint('/auth/logout'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRF-TOKEN': token,
    },
  })
  if (!response.ok) {
    throw new Error('Logout failed.')
  }

  csrfToken = null
}

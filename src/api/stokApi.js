const API_ROOT = import.meta.env.VITE_API_ROOT ?? '/crud'

function endpoint(path) {
  return `${API_ROOT}${path}`
}

function normalizeDataset(response) {
  const payload = response?.data ?? response
  const dataset = payload?.dataset ?? payload?.data ?? payload?.rows ?? []

  if (!Array.isArray(dataset)) {
    return []
  }

  if (dataset.length === 0 || !Array.isArray(dataset[0])) {
    return dataset
  }

  const columns = Object.keys(payload?.metadata ?? {})
  return dataset.map((row) =>
    columns.reduce((record, column, index) => {
      record[column] = row[index]
      return record
    }, {}),
  )
}

async function requestJson(path, options = {}) {
  const response = await fetch(endpoint(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`)
  }

  const payload = await response.json()

  if (payload?.result === false) {
    throw new Error(payload?.message ?? 'ERP API returned an error')
  }

  return normalizeDataset(payload)
}

export function getStokKartlar() {
  return requestJson('/FastAPI/Stok/Kartlar', { method: 'GET' })
}

export function getVaryantsByStokId(stokNo) {
  return requestJson('/FastAPI/Stok/VaryantById', {
    method: 'POST',
    body: JSON.stringify({ STOK_NO: stokNo }),
  })
}

export function getVaryantsOfVaryant(anaStokVaryantNo) {
  return requestJson('/FastAPI/Stok/VaryantsOfVaryant', {
    method: 'POST',
    cache: 'no-store',
    body: JSON.stringify({ ANA_STOK_VARYANT_NO: anaStokVaryantNo }),
  })
}

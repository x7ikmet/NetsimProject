export function updateTreeSelection(current, rows, selected) {
  const next = { ...current }
  const pending = Array.isArray(rows) ? [...rows] : [rows]

  while (pending.length) {
    const row = pending.pop()
    if (selected && row.getCanSelect?.() !== false) next[row.id] = true
    else delete next[row.id]
    pending.push(...row.subRows)
  }

  return next
}

export function filterRows(rows, query, columns) {
  const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR')
  if (!normalizedQuery) return rows

  return rows.filter((row) =>
    columns.some((column) =>
      String(row[column.key] ?? '')
        .toLocaleLowerCase('tr-TR')
        .includes(normalizedQuery),
    ),
  )
}

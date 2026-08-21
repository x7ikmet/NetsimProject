const columns = [
  { id: 'line', label: 'Satır', width: 28, value: (_, index) => index + 1, numeric: true },
  { id: 'stockCode', label: 'Stok Kodu', width: 64, value: (row) => row.STOK_KODU },
  { id: 'stockName', label: 'Stok Adı', width: 120, value: (row) => row.STOK_ADI, indent: true },
  { id: 'variantCode', label: 'Varyant Kodu', width: 70, value: (row) => row.VARYANT_KODU },
  { id: 'variantName', label: 'Varyant Adı', width: 138, value: (row) => row.VARYANT_ADI },
  { id: 'quantity', label: 'Miktar', width: 44, value: (row) => row.MIKTAR, numeric: true },
  { id: 'unit', label: 'Birim', width: 38, value: (row) => row.BIRIM },
  { id: 'unitPrice', label: 'Birim Fiyat', width: 64, value: (row) => row.BIRIM_FIYAT, numeric: true },
  { id: 'amount', label: 'Tutar', width: 64, value: (row) => row.TUTAR, numeric: true },
  { id: 'mainCost', label: 'Ana Maliyet', width: 74, value: (row) => row.ANA_MALIYET, numeric: true },
  { id: 'currency', label: 'Döviz', width: 46, value: (row) => row.DOVIZ_BIRIMI },
  { id: 'level', label: 'Seviye', width: 42, value: (row) => row.SEVIYE ?? row.depth, numeric: true },
]

const tableWidth = columns.reduce((total, column) => total + column.width, 0)

export function getProductTreePdfColumns(visibleColumnIds) {
  if (!visibleColumnIds) return columns

  const visibleIds = new Set(visibleColumnIds)
  const selected = columns.filter((column) => visibleIds.has(column.id))
  const selectedWidth = selected.reduce(
    (total, column) => total + column.width,
    0,
  )

  return selected.map((column) => ({
    ...column,
    width: (column.width / selectedWidth) * tableWidth,
  }))
}

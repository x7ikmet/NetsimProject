export function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return '---'
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : value.toLocaleString('tr-TR')
  }

  return value
}

export function getStockLabel(stock) {
  if (!stock) return ''
  return `${stock.STOK_KODU ?? stock.STOK_NO} - ${stock.STOK_ADI ?? ''}`
}

export function getVariantLabel(variant) {
  if (!variant) return ''
  return `${variant.VARYANT_KODU ?? variant.STOK_VARYANT_NO} - ${variant.VARYANT_ADI ?? ''}`
}

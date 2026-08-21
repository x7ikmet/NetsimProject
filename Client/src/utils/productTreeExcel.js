import { utils, writeFileXLSX } from 'xlsx'
import { getProductTreePdfColumns } from '../components/productTreePdfColumns'
import { flattenProductTree } from './productTree'

const numberFormats = {
  line: '0',
  quantity: '#,##0.########',
  unitPrice: '#,##0.00',
  amount: '#,##0.00',
  mainCost: '#,##0.00',
  level: '0',
}

export function createProductTreeWorkbook(tree, visibleColumnIds, metadata = {}) {
  const columns = getProductTreePdfColumns(visibleColumnIds)
  const rows = flattenProductTree(tree)
  const totalCost = tree.reduce(
    (total, row) => total + (Number(row.ANA_MALIYET) || 0),
    0,
  )
  const worksheet = utils.aoa_to_sheet([
    ['Stok Kartı', metadata.stock ?? ''],
    ['Varyant', metadata.variant ?? ''],
    ['Miktar', metadata.quantity ?? '', metadata.unit ?? ''],
    ['Maliyet Yöntemi', metadata.costMethod ?? ''],
    ['Toplam Maliyet', totalCost, tree[0]?.DOVIZ_BIRIMI ?? ''],
    [],
    columns.map((column) => column.label),
    ...rows.map((row, rowIndex) =>
      columns.map((column) => {
        const value = column.value(row, rowIndex)
        if (column.numeric) {
          const number = Number(value)
          return Number.isFinite(number) ? number : null
        }
        return `${column.indent ? '  '.repeat(row.depth) : ''}${value ?? ''}`
      }),
    ),
  ])

  worksheet['!cols'] = columns.map((column) => ({
    wch: Math.max(8, Math.round(column.width / 7)),
  }))
  worksheet['!cols'][0] ??= { wch: 8 }
  worksheet['!cols'][1] ??= { wch: 8 }
  worksheet['!cols'][0].wch = Math.max(18, worksheet['!cols'][0].wch)
  worksheet['!cols'][1].wch = Math.max(28, worksheet['!cols'][1].wch)
  worksheet['!rows'] = [
    {}, {}, {}, {}, {}, {}, {},
    ...rows.map((row) => ({ level: Math.min(row.depth, 7) })),
  ]
  worksheet['!autofilter'] = {
    ref: `A7:${utils.encode_col(columns.length - 1)}${rows.length + 7}`,
  }

  const mainCostColumnIndex = columns.findIndex((column) => column.id === 'mainCost')
  if (mainCostColumnIndex >= 0) {
    const rootCells = rows.flatMap((row, rowIndex) =>
      row.depth === 0
        ? [utils.encode_cell({ r: rowIndex + 7, c: mainCostColumnIndex })]
        : [],
    )
    worksheet.B5.f = `SUM(${rootCells.join(',')})`
  }
  worksheet.B5.z = numberFormats.mainCost

  columns.forEach((column, columnIndex) => {
    const format = numberFormats[column.id]
    if (!format) return

    rows.forEach((_, rowIndex) => {
      const cell = worksheet[utils.encode_cell({ r: rowIndex + 7, c: columnIndex })]
      if (cell) cell.z = format
    })
  })

  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Ürün Ağacı')
  return workbook
}

export function saveProductTreeExcel(tree, visibleColumnIds, filename, metadata) {
  writeFileXLSX(createProductTreeWorkbook(tree, visibleColumnIds, metadata), filename, {
    compression: true,
  })
}

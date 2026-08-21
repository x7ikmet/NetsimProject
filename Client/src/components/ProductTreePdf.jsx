import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import { formatValue } from '../utils/formatters'
import { flattenProductTree } from '../utils/productTree'
import { getProductTreePdfColumns } from './productTreePdfColumns'

const notoSansRegular = new URL(
  '../assets/fonts/NotoSans-Regular.ttf',
  import.meta.url,
).href
const notoSansBold = new URL(
  '../assets/fonts/NotoSans-Bold.ttf',
  import.meta.url,
).href

Font.register({
  family: 'Noto Sans',
  fonts: [
    { src: notoSansRegular, fontWeight: 400 },
    { src: notoSansBold, fontWeight: 700 },
  ],
})
Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Noto Sans',
    fontSize: 7,
    color: '#0f172a',
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 14 },
  summary: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 9,
  },
  summaryLastRow: { flexDirection: 'row' },
  summaryItem: { flexGrow: 1, flexBasis: 0, paddingRight: 16 },
  summaryLabel: {
    color: '#6b7280',
    fontSize: 6,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  summaryValue: { fontWeight: 700, fontSize: 8.5 },
  tableTitle: { fontWeight: 700, fontSize: 10, marginBottom: 7 },
  table: {
    borderTop: '0.6 solid #6b7280',
    borderLeft: '0.6 solid #6b7280',
  },
  row: {
    flexDirection: 'row',
    minHeight: 25,
  },
  rootRow: { backgroundColor: '#f3f4f6', fontWeight: 700 },
  header: {
    backgroundColor: '#e5e7eb',
    color: '#111827',
    fontWeight: 700,
    minHeight: 28,
  },
  cell: {
    flexGrow: 0,
    flexShrink: 0,
    padding: '5 4',
    borderRight: '0.6 solid #9ca3af',
    borderBottom: '0.6 solid #9ca3af',
    justifyContent: 'center',
  },
  headerCell: {
    borderRightColor: '#6b7280',
    borderBottomColor: '#6b7280',
  },
  numeric: { textAlign: 'right' },
})

function display(value) {
  return String(formatValue(value))
}

export default function ProductTreePdf({
  stock,
  variant,
  quantity,
  unit,
  costMethod,
  tree,
  visibleColumnIds,
}) {
  const rows = flattenProductTree(tree)
  const reportColumns = getProductTreePdfColumns(visibleColumnIds)
  const totalCost = tree.reduce(
    (total, row) => total + (Number(row.ANA_MALIYET) || 0),
    0,
  )
  const currency = tree[0]?.DOVIZ_BIRIMI
  const summaryRows = [
    [
      ['Stok Kartı', `${display(stock?.STOK_KODU)} - ${display(stock?.STOK_ADI)}`],
      [
        'Varyant',
        `${display(variant?.VARYANT_KODU)} - ${display(variant?.VARYANT_ADI)}`,
      ],
    ],
    [
      ['Miktar', `${display(quantity)} ${display(unit)}`],
      ['Maliyet Yöntemi', display(costMethod)],
      ['Toplam Maliyet', `${display(totalCost)} ${display(currency)}`],
    ],
  ]

  return (
    <Document title="Ürün Ağacı Maliyet Raporu">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Ürün Ağacı Maliyet Raporu</Text>

        <View style={styles.summary}>
          {summaryRows.map((summaryRow, rowIndex) => (
            <View
              key={summaryRow[0][0]}
              style={
                rowIndex === summaryRows.length - 1
                  ? styles.summaryLastRow
                  : styles.summaryRow
              }
            >
              {summaryRow.map(([label, value]) => (
                <View key={label} style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  <Text style={styles.summaryValue}>{value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.tableTitle}>Ağaç Satırları</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.header]} wrap={false}>
            {reportColumns.map((column) => (
              <View
                key={column.label}
                style={[
                  styles.cell,
                  styles.headerCell,
                  column.numeric && styles.numeric,
                  { width: column.width },
                ]}
              >
                <Text>{column.label}</Text>
              </View>
            ))}
          </View>

          {rows.map((row, rowIndex) => (
            <View
              key={row.treeId ?? rowIndex}
              style={[
                styles.row,
                row.depth === 0 && styles.rootRow,
              ]}
              wrap={false}
            >
              {reportColumns.map((column) => (
                <View
                  key={column.label}
                  style={[
                    styles.cell,
                    column.numeric && styles.numeric,
                    column.indent && { paddingLeft: 4 + row.depth * 7 },
                    { width: column.width },
                  ]}
                >
                  <Text>{display(column.value(row, rowIndex))}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

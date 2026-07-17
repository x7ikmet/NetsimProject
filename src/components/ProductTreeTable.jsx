import Table from 'rsuite/Table'
import { treeColumns } from '../config/tableColumns'
import { formatValue } from '../utils/formatters'

const { Column, HeaderCell, Cell } = Table
const TREE_TABLE_HEIGHT = 560

export function ProductTreeTable({ rows, expandedIds, onToggle, emptyText }) {
  if (!rows.length) {
    return (
      <div className="table-shell">
        <div className="empty-cell">{emptyText}</div>
      </div>
    )
  }

  return (
    <div className="table-shell rsuite-tree-shell">
      <Table
        isTree
        bordered
        cellBordered
        height={TREE_TABLE_HEIGHT}
        data={rows}
        rowKey="treeId"
        rowHeight={38}
        headerHeight={38}
        expandedRowKeys={Array.from(expandedIds)}
        onExpandChange={(_, rowData) => onToggle(rowData.treeId)}
      >
        {treeColumns.map((column) => (
          <Column
            key={column.key}
            width={parseInt(column.width, 10)}
            align={column.align === 'right' ? 'right' : 'left'}
            fixed={column.key === 'rowNo'}
          >
            <HeaderCell className={column.key === 'rowNo' ? 'tree-control-header' : ''}>
              {column.label}
            </HeaderCell>
            <TreeGridCell column={column} />
          </Column>
        ))}
      </Table>
    </div>
  )
}

function TreeGridCell({ column, rowData, depth = 0, ...props }) {
  return (
    <Cell
      rowData={rowData}
      depth={depth}
      {...props}
      className={getCellClassName(column.key)}
    >
      {renderCellValue(column.key, rowData, depth)}
    </Cell>
  )
}

function renderCellValue(columnKey, rowData, depth) {
  if (columnKey === 'rowNo') return ''

  const value = formatValue(rowData?.[columnKey])

  if (columnKey !== 'STOK_ADI') return value

  return (
    <span
      className={`stock-name-value ${depth > 0 ? 'is-child' : 'is-root'}`}
      style={{ '--stock-depth': depth }}
    >
      {value}
    </span>
  )
}

function getCellClassName(columnKey) {
  if (columnKey === 'rowNo') return 'tree-control-cell'
  if (columnKey === 'STOK_ADI') return 'stock-name-cell'
  return ''
}

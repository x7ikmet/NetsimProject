import { treeColumns } from '../config/tableColumns'
import { formatValue } from '../utils/formatters'

export function ProductTreeTable({ rows, expandedIds, onToggle, emptyText }) {
  return (
    <div className="table-shell">
      <table className="data-table tree-table">
        <colgroup>
          {treeColumns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {treeColumns.map((column) => (
              <th key={column.key} className={column.align === 'right' ? 'align-right' : ''}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => {
              const hasChildren = row.children?.length > 0

              return (
                <tr key={row.treeId ?? row.rowNo}>
                  {treeColumns.map((column) => (
                    <TreeCell
                      key={column.key}
                      column={column}
                      row={row}
                      hasChildren={hasChildren}
                      expandedIds={expandedIds}
                      onToggle={onToggle}
                    />
                  ))}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={treeColumns.length} className="empty-cell">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function TreeCell({ column, row, hasChildren, expandedIds, onToggle }) {
  const className = column.align === 'right' ? 'align-right' : ''

  if (column.key === 'rowNo') {
    return (
      <td className="tree-toggle-cell">
        {hasChildren ? (
          <button
            className="toggle-button"
            type="button"
            onClick={() => onToggle(row.treeId)}
          >
            {expandedIds.has(row.treeId) ? '-' : '+'}
          </button>
        ) : null}
      </td>
    )
  }

  if (column.key !== 'STOK_ADI') {
    return <td className={className}>{formatValue(row[column.key])}</td>
  }

  return (
    <td className={className}>
      <div
        className={`tree-name ${row.level > 0 ? 'is-child' : 'is-root'}`}
        style={{ '--tree-level': row.level }}
      >
        <span>{formatValue(row[column.key])}</span>
      </div>
    </td>
  )
}

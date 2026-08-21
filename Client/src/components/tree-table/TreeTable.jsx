import { Fragment, useEffect, useMemo, useRef } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Columns3,
} from 'lucide-react'
import {
  columnFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowExpandingFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { updateTreeSelection } from './treeSelection'
import './TreeTable.css'

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
  columnPinningFeature,
  columnSizingFeature,
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
})

const selectTableState = (state) => state

export function TreeTable({
  data,
  columns,
  getRowId,
  getChildren = (row) => row.children,
  expandedIds,
  onExpandedIdsChange,
  enableRowSelection = true,
  pinnedColumns,
  searchPlaceholder = 'Tabloda ara...',
  renderAfterRow,
  renderToolbar,
  onVisibleColumnIdsChange,
  emptyMessage = 'Gösterilecek kayıt yok.',
  className,
}) {
  const expanded = useMemo(
    () =>
      Object.fromEntries(
        [...(expandedIds ?? [])].map((rowId) => [String(rowId), true]),
      ),
    [expandedIds],
  )

  const table = useTable(
    {
      features,
      data,
      columns,
      getRowId,
      getSubRows: getChildren,
      state: { expanded },
      onExpandedChange: (updater) => {
        const next = typeof updater === 'function' ? updater(expanded) : updater
        onExpandedIdsChange?.(
          new Set(
            Object.entries(next)
              .filter(([, isExpanded]) => isExpanded)
              .map(([rowId]) => rowId),
          ),
        )
      },
      enableRowSelection,
      enableSubRowSelection: true,
      filterFromLeafRows: true,
      globalFilterFn: 'includesString',
      autoResetExpanded: false,
      initialState: pinnedColumns
        ? { columnPinning: pinnedColumns }
        : undefined,
    },
    selectTableState,
  )

  const visibleColumns = table.getVisibleLeafColumns()

  return (
    <div className="tree-table-shell">
      <TreeTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        onVisibleColumnIdsChange={onVisibleColumnIdsChange}
      >
        {renderToolbar?.(table)}
      </TreeTableToolbar>

      <div className="tree-table-scroll">
        <Table className={className}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={getPinningStyles(header.column)}
                  >
                    {header.isPlaceholder ? null : (
                      <TreeTableHeader header={header} table={table} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() ? 'selected' : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={getPinningStyles(cell.column)}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderAfterRow?.(row, visibleColumns.length)}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="tree-table-empty"
                  colSpan={visibleColumns.length || 1}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function TreeTableSelectionColumn() {
  return {
    id: 'select',
    size: 42,
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <SelectionCheckbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={(event) =>
          table.setRowSelection((current) =>
            updateTreeSelection(
              current,
              table.getCoreRowModel().rows,
              event.target.checked,
            ),
          )
        }
        aria-label="Tüm satırları seç"
      />
    ),
    cell: ({ row, table }) => (
      <SelectionCheckbox
        checked={row.getIsSelected()}
        indeterminate={
          row.getIsSomeSelected() ||
          (!row.getIsSelected() && row.getIsAllSubRowsSelected())
        }
        disabled={!row.getCanSelect()}
        onChange={(event) =>
          table.setRowSelection((current) =>
            updateTreeSelection(current, row, event.target.checked),
          )
        }
        aria-label={`${row.getDisplayIndex() + 1}. satırı seç`}
      />
    ),
  }
}

function SelectionCheckbox({ indeterminate, ...props }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.indeterminate = Boolean(indeterminate)
  }, [indeterminate])

  return <input ref={inputRef} type="checkbox" {...props} />
}

export function TreeTableNode({ row, children }) {
  return (
    <div
      className="tree-table-node"
      style={{ '--tree-depth': row.depth }}
    >
      {row.getCanExpand() ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={row.getToggleExpandedHandler()}
          aria-label={row.getIsExpanded() ? 'Satırı kapat' : 'Satırı aç'}
        >
          {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
        </Button>
      ) : (
        <span className="tree-table-node-spacer" aria-hidden="true" />
      )}
      {children}
    </div>
  )
}

function TreeTableToolbar({
  table,
  searchPlaceholder,
  onVisibleColumnIdsChange,
  children,
}) {
  return (
    <div className="tree-table-toolbar">
      <Input
        className="tree-table-search"
        value={table.state.globalFilter ?? ''}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
      />

      <span className="tree-table-selection-count" aria-live="polite">
        {table.getSelectedRowModel().flatRows.length} satır seçili
      </span>

      {children}

      <details className="tree-table-columns">
        <summary>
          <Columns3 aria-hidden="true" />
          Sütunlar
        </summary>
        <div className="tree-table-columns-menu">
          {table
            .getAllLeafColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <label key={column.id}>
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={(event) => {
                    const isVisible = event.target.checked
                    column.toggleVisibility(isVisible)
                    onVisibleColumnIdsChange?.(
                      table
                        .getAllLeafColumns()
                        .filter((item) =>
                          item.id === column.id
                            ? isVisible
                            : item.getIsVisible(),
                        )
                        .map((item) => item.id),
                    )
                  }}
                />
                {column.columnDef.meta?.label ?? column.id}
              </label>
            ))}
        </div>
      </details>
    </div>
  )
}

function TreeTableHeader({ header, table }) {
  const column = header.column
  const content = <table.FlexRender header={header} />

  if (!column.getCanSort()) return content

  const direction = column.getIsSorted()
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={column.getToggleSortingHandler()}
    >
      {content}
      {direction === 'asc' ? (
        <ArrowUp data-icon="inline-end" />
      ) : direction === 'desc' ? (
        <ArrowDown data-icon="inline-end" />
      ) : (
        <ChevronsUpDown data-icon="inline-end" />
      )}
    </Button>
  )
}

function getPinningStyles(column) {
  const pinned = column.getIsPinned()
  if (!pinned) return undefined

  return {
    insetInlineStart:
      pinned === 'start' ? `${column.getStart('start')}px` : undefined,
    insetInlineEnd:
      pinned === 'end' ? `${column.getAfter('end')}px` : undefined,
    position: 'sticky',
    width: column.getSize(),
    zIndex: 1,
  }
}

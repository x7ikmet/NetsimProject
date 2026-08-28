import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Columns3,
  Filter,
  LoaderCircle,
  RotateCcw,
} from 'lucide-react'
import {
  columnSizingFeature,
  columnVisibilityFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { getFilteredStokKartlar } from '@/api/stokApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import './StockCardsPage.css'

const features = tableFeatures({ columnSizingFeature, columnVisibilityFeature })
const selectTableState = (state) => state
const numericFilters = new Set(['STOK_TIP_NO'])

const emptyFilters = {
  STOK_KODU: '',
  STOK_ADI: '',
  KAYIT_DURUMU: 'ALL',
  STOK_TIP_NO: '',
  SORT_BY: 'STOK_KODU',
  PAGE: 1,
  PAGE_SIZE: 25,
}

function apiFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).map(([key, value]) => {
      if (value === '' || value === 'ALL') return [key, null]
      if (numericFilters.has(key)) return [key, Number(value)]
      return [key, typeof value === 'string' ? value.trim() || null : value]
    }),
  )
}

function display(value) {
  return value === null || value === undefined || value === '' ? '—' : value
}

function stockStatus(value) {
  if (value === 'O') return 'Onaylandı'
  if (value === 'A') return 'Aktif'
  return display(value)
}

function trackingType(value) {
  if (value === 'M') return 'Miktar'
  if (value === 'H') return 'Hizmet'
  return display(value)
}

function SortHeader({ column, label, query, onSort }) {
  const active = query.SORT_BY === column

  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => onSort(column)}>
      {label}
      {active ? <ArrowUp data-icon="inline-end" aria-hidden="true" /> : null}
    </Button>
  )
}

function ColumnPicker({ table }) {
  return (
    <details className="stock-columns">
      <summary><Columns3 aria-hidden="true" />Sütunlar</summary>
      <div className="stock-columns-menu">
        {table.getAllLeafColumns().map((column) => (
          <label key={column.id}>
            <input
              type="checkbox"
              checked={column.getIsVisible()}
              onChange={(event) => column.toggleVisibility(event.target.checked)}
            />
            {column.columnDef.meta?.label ?? column.id}
          </label>
        ))}
      </div>
    </details>
  )
}

export function StockCardsPage() {
  const [draft, setDraft] = useState(emptyFilters)
  const [query, setQuery] = useState(emptyFilters)
  const [result, setResult] = useState({ items: [], total: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState(new Set())

  useEffect(() => {
    const controller = new AbortController()

    getFilteredStokKartlar(apiFilters(query), controller.signal)
      .then(setResult)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [query])

  function updateFilter(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function load(nextQuery) {
    setLoading(true)
    setError('')
    setQuery(nextQuery)
  }

  function search(event) {
    event.preventDefault()
    load({ ...draft, PAGE: 1 })
  }

  function reset() {
    setDraft(emptyFilters)
    load(emptyFilters)
  }

  function changePage(page) {
    setDraft((current) => ({ ...current, PAGE: page }))
    load({ ...query, PAGE: page })
  }

  function changePageSize(value) {
    const pageSize = Number(value)
    setDraft((current) => ({ ...current, PAGE: 1, PAGE_SIZE: pageSize }))
    load({ ...query, PAGE: 1, PAGE_SIZE: pageSize })
  }

  const changeSort = useCallback((column) => {
    setDraft((current) => ({ ...current, SORT_BY: column }))
    setLoading(true)
    setError('')
    setQuery({
      ...query,
      SORT_BY: column,
      PAGE: 1,
    })
  }, [query])

  function toggleGroup(groupName) {
    setCollapsedGroups((current) => {
      const next = new Set(current)
      if (next.has(groupName)) next.delete(groupName)
      else next.add(groupName)
      return next
    })
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'STOK_NO',
        header: () => <SortHeader column="STOK_NO" label="Stok No" query={query} onSort={changeSort} />,
        cell: ({ row }) => <span className="stock-number">{display(row.original.STOK_NO)}</span>,
        meta: { label: 'Stok No' },
      },
      {
        accessorKey: 'KAYIT_DURUMU',
        header: 'Kayıt Durumu',
        cell: ({ row }) => <span className={`stock-status stock-status-${row.original.KAYIT_DURUMU ?? 'none'}`}>{stockStatus(row.original.KAYIT_DURUMU)}</span>,
        meta: { label: 'Kayıt Durumu' },
      },
      {
        accessorKey: 'STOK_KODU',
        header: () => <SortHeader column="STOK_KODU" label="Stok Kodu" query={query} onSort={changeSort} />,
        cell: ({ getValue }) => <strong className="stock-code">{display(getValue())}</strong>,
        meta: { label: 'Stok Kodu' },
      },
      {
        accessorKey: 'STOK_ADI',
        header: () => <SortHeader column="STOK_ADI" label="Stok Adı" query={query} onSort={changeSort} />,
        cell: ({ getValue }) => <span className="stock-name" title={getValue()}>{display(getValue())}</span>,
        meta: { label: 'Stok Adı' },
      },
      { accessorKey: 'URETICI_KODU', header: 'Üretici Kodu', cell: ({ getValue }) => display(getValue()), meta: { label: 'Üretici Kodu' } },
      { accessorKey: 'NUMARA', header: 'Numara', cell: ({ getValue }) => display(getValue()), meta: { label: 'Numara' } },
      { accessorKey: 'TAKIP_SEKLI', header: 'Takip Şekli', cell: ({ getValue }) => trackingType(getValue()), meta: { label: 'Takip Şekli' } },
      { accessorKey: 'BIRIM1', header: 'Birim', cell: ({ getValue }) => display(getValue()), meta: { label: 'Birim' } },
      { accessorKey: 'VERGI_UYST_ADI', header: 'Vergi', cell: ({ getValue }) => display(getValue()), meta: { label: 'Vergi' } },
    ],
    [query, changeSort],
  )

  const table = useTable({ features, data: result.items, columns }, selectTableState)
  const groupedRows = Object.groupBy(
    table.getRowModel().rows,
    (row) => row.original.STOK_TIP_ADI || 'Tanımsız stok tipi',
  )
  const totalPages = result.total ? Math.ceil(result.total / query.PAGE_SIZE) : null
  const canGoNext = totalPages
    ? query.PAGE < totalPages
    : result.items.length === query.PAGE_SIZE

  return (
    <main className="stock-page">
      <header className="stock-page-header">
        <div>
          <h1>Stok Kart Listesi</h1>
        </div>
        <strong>{result.total ?? result.items.length} kayıt</strong>
      </header>

      <form className="stock-filters" onSubmit={search}>
        <label>
          <span>Stok kodu</span>
          <Input value={draft.STOK_KODU} onChange={(event) => updateFilter('STOK_KODU', event.target.value)} placeholder="Stok kodu" />
        </label>
        <label>
          <span>Stok adı</span>
          <Input value={draft.STOK_ADI} onChange={(event) => updateFilter('STOK_ADI', event.target.value)} placeholder="Stok adında ara" />
        </label>
        <label>
          <span>Kayıt durumu</span>
            <Select value={draft.KAYIT_DURUMU} onValueChange={(value) => updateFilter('KAYIT_DURUMU', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectGroup>
                <SelectItem value="ALL">Tüm durumlar</SelectItem>
                <SelectItem value="O">Onaylı</SelectItem>
                <SelectItem value="A">Aktif</SelectItem>
              </SelectGroup></SelectContent>
            </Select>
        </label>
        <label>
          <span>Stok tip no</span>
          <Input inputMode="numeric" value={draft.STOK_TIP_NO} onChange={(event) => updateFilter('STOK_TIP_NO', event.target.value)} placeholder="Tümü" />
        </label>
        <div className="stock-filter-actions">
          <Button type="submit" disabled={loading}>
            <Filter data-icon="inline-start" aria-hidden="true" />Filtrele
          </Button>
          <Button type="button" variant="outline" onClick={reset} disabled={loading}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />Temizle
          </Button>
          <ColumnPicker table={table} />
        </div>
      </form>

      {error ? <p className="stock-error" role="alert">Stok kartları yüklenemedi: {error}</p> : null}

      <div className="stock-table-shell">
        {loading ? (
          <div className="stock-loading"><LoaderCircle aria-hidden="true" />Stok kartları yükleniyor…</div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? Object.entries(groupedRows).flatMap(([groupName, rows]) => {
                const isCollapsed = collapsedGroups.has(groupName)
                return [
                  <TableRow className="stock-group-row" key={`group-${groupName}`}>
                    <TableCell colSpan={table.getVisibleLeafColumns().length}>
                      <button type="button" onClick={() => toggleGroup(groupName)} aria-expanded={!isCollapsed}>
                        {isCollapsed ? <ChevronRight aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                        <span>Stok Tipi</span>
                        <strong>{groupName}</strong>
                        <small>{rows.length} kayıt</small>
                      </button>
                    </TableCell>
                  </TableRow>,
                  ...(isCollapsed ? [] : rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>)}
                    </TableRow>
                  ))),
                ]
              }) : (
                <TableRow><TableCell className="stock-table-empty" colSpan={table.getVisibleLeafColumns().length}>Filtrelere uygun stok kartı bulunamadı.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <footer className="stock-pagination">
        <div className="stock-page-size">
          <span>Sayfa başına</span>
          <Select value={String(query.PAGE_SIZE)} onValueChange={changePageSize}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectGroup></SelectContent>
          </Select>
        </div>
        <span>Sayfa {query.PAGE}{totalPages ? ` / ${totalPages}` : ''}</span>
        <div>
          <Button variant="outline" onClick={() => changePage(query.PAGE - 1)} disabled={loading || query.PAGE === 1}>
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          </Button>
          <Button variant="outline" onClick={() => changePage(query.PAGE + 1)} disabled={loading || !canGoNext}>
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
      </footer>
    </main>
  )
}

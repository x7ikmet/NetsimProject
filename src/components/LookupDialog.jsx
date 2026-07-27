import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatValue } from '../utils/formatters'
import { filterRows } from '../utils/tableFilters'

export function LookupDialog({
  title,
  description,
  rows,
  columns,
  open,
  loading,
  selectedRow,
  onClose,
  onSelect,
}) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState(selectedRow)

  const visibleRows = useMemo(
    () => filterRows(rows, query, columns),
    [rows, query, columns],
  )

  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="lookup-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Pencereyi kapat"
          >
            <X />
          </Button>
        </div>

        <div className="modal-toolbar">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ara..."
            autoFocus
          />
          <span className="muted-label">{visibleRows.length} kayıt</span>
        </div>

        <div className="lookup-table-wrap">
          <table className="data-table lookup-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length}>Yükleniyor...</td>
                </tr>
              ) : visibleRows.length ? (
                visibleRows.map((row, index) => {
                  const isSelected = draft === row
                  return (
                    <tr
                      key={`${row.STOK_NO ?? row.STOK_VARYANT_NO}-${index}`}
                      className={isSelected ? 'is-selected' : ''}
                      onClick={() => setDraft(row)}
                      onDoubleClick={() => onSelect(row)}
                    >
                      {columns.map((column) => (
                        <td key={column.key}>{formatValue(row[column.key])}</td>
                      ))}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={columns.length}>Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <Button variant="outline" type="button" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            type="button"
            disabled={!draft}
            onClick={() => onSelect(draft)}
          >
            Seç
          </Button>
        </div>
      </section>
    </div>
  )
}

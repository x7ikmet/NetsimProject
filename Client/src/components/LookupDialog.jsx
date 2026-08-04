import { useEffect, useId, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatValue } from '../utils/formatters'
import { filterRows } from '../utils/tableFilters'

export function LookupDialog({
  title,
  description,
  rows,
  columns,
  loading,
  selectedRow,
  onClose,
  onSelect,
}) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState(selectedRow)
  const titleId = useId()
  const descriptionId = useId()

  const visibleRows = useMemo(
    () => filterRows(rows, query, columns),
    [rows, query, columns],
  )

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="lookup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            <p id={descriptionId}>{description}</p>
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
          <div className="modal-search">
            <Search aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kod veya ada göre ara"
              autoFocus
            />
          </div>
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
                      tabIndex="0"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => setDraft(row)}
                      onDoubleClick={() => onSelect(row)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') onSelect(row)
                        if (event.key === ' ') {
                          event.preventDefault()
                          setDraft(row)
                        }
                      }}
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

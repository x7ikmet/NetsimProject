import { useEffect, useMemo, useState } from 'react'
import { Eye, Filter, LoaderCircle, RotateCcw } from 'lucide-react'
import { tableFeatures, useTable } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { getActivityLogs } from '@/api/activityLogApi'
import './ActivityLogsPage.css'

const eventOptions = [
  { value: 'ALL', label: 'Tüm işlemler' },
  { value: 'GRS_BASARILI', label: 'Başarılı giriş' },
  { value: 'GRS_BASARISIZ', label: 'Başarısız giriş' },
  { value: 'CIKIS', label: 'Çıkış' },
  { value: 'KULLANICI_EKLE', label: 'Kullanıcı oluşturma' },
  { value: 'MLYT_HESAPLA', label: 'Maliyet hesaplama' },
  { value: 'VARYANT_DEGISTIR', label: 'Varyant değiştirme' },
  { value: 'BILESEN_EKLE', label: 'Bileşen ekleme' },
  { value: 'BILESEN_DEGISTIR', label: 'Bileşen değiştirme' },
  { value: 'BILESEN_SIL', label: 'Bileşen silme' },
  { value: 'PDF_AKTAR', label: 'PDF aktarma' },
  { value: 'EXCEL_AKTAR', label: 'Excel aktarma' },
]

const features = tableFeatures({})
const selectTableState = (state) => state
const emptyFilters = { username: '', eventCode: 'ALL', from: '', to: '' }

export function ActivityLogsPage() {
  const [draft, setDraft] = useState(emptyFilters)
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ items: [], total: 0, pageSize: 25 })
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getActivityLogs(
      {
        page,
        pageSize: 25,
        username: filters.username,
        eventCode: filters.eventCode === 'ALL' ? '' : filters.eventCode,
        from: filters.from ? `${filters.from}T00:00:00` : '',
        to: filters.to ? `${filters.to}T23:59:59` : '',
      },
      controller.signal,
    )
      .then(setResult)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [filters, page])

  const columns = useMemo(
    () => [
      { accessorKey: 'date', header: 'Tarih', cell: ({ row }) => formatDate(row.original.date) },
      { accessorKey: 'username', header: 'Kullanıcı' },
      { accessorKey: 'operation', header: 'İşlem' },
      { accessorKey: 'description', header: 'Açıklama' },
      { accessorKey: 'sourceModule', header: 'Modül' },
      {
        id: 'details',
        header: '',
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelected(row.original)}
            aria-label="Log detayını göster"
          >
            <Eye />
          </Button>
        ),
      },
    ],
    [],
  )
  const table = useTable({ features, data: result.items, columns }, selectTableState)
  const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize))

  function applyFilters(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setPage(1)
    setFilters(draft)
  }

  function clearFilters() {
    setLoading(true)
    setError('')
    setDraft(emptyFilters)
    setFilters(emptyFilters)
    setPage(1)
  }

  function changePage(nextPage) {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  return (
    <main className="activity-page">
      <header className="activity-header">
        <div>
          <h1>Log Kayıtları</h1>
        </div>
        <strong>{result.total} kayıt</strong>
      </header>

      <form className="activity-filters" onSubmit={applyFilters}>
        <label>
          <span>Kullanıcı</span>
          <Input
            value={draft.username}
            onChange={(event) => setDraft({ ...draft, username: event.target.value })}
            placeholder="Kullanıcı adı"
          />
        </label>
        <label>
          <span>İşlem</span>
          <Select
            items={eventOptions}
            value={draft.eventCode}
            onValueChange={(eventCode) => setDraft({ ...draft, eventCode })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {eventOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
        <label>
          <span>Başlangıç</span>
          <Input type="date" value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} />
        </label>
        <label>
          <span>Bitiş</span>
          <Input type="date" value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} />
        </label>
        <div className="activity-filter-actions">
          <Button type="submit"><Filter data-icon="inline-start" />Filtrele</Button>
          <Button type="button" variant="outline" onClick={clearFilters}>
            <RotateCcw data-icon="inline-start" />Temizle
          </Button>
        </div>
      </form>

      {error ? <p className="activity-error" role="alert">{error}</p> : null}

      <div className="activity-table-shell">
        {loading ? (
          <div className="activity-loading"><LoaderCircle aria-hidden="true" />Kayıtlar yükleniyor…</div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>
                  ))}
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={columns.length}>Filtreye uygun kayıt bulunamadı.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <footer className="activity-pagination">
        <span>Sayfa {page} / {pageCount}</span>
        <div>
          <Button type="button" variant="outline" disabled={page === 1 || loading} onClick={() => changePage(page - 1)}></Button>
          <Button type="button" variant="outline" disabled={page === pageCount || loading} onClick={() => changePage(page + 1)}></Button>
        </div>
      </footer>

      <ActivityLogDialog log={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </main>
  )
}

function ActivityLogDialog({ log, onOpenChange }) {
  return (
    <Dialog open={Boolean(log)} onOpenChange={onOpenChange}>
      <DialogContent className="activity-dialog">
        <DialogHeader>
          <DialogTitle>{log?.operation ?? 'Aktivite detayı'}</DialogTitle>
          <DialogDescription>{log ? `${log.username} · ${formatDate(log.date)}` : ''}</DialogDescription>
        </DialogHeader>
        {log ? (
          <dl className="activity-detail-list">
            <div><dt>Log kodu</dt><dd>{log.logCode}</dd></div>
            <div><dt>Açıklama</dt><dd>{log.description || '—'}</dd></div>
            <div><dt>Kaynak</dt><dd>{log.sourceModule} / {log.sourceNumber ?? '—'} / {log.sourceDetailNumber ?? '—'}</dd></div>
            <div><dt>IP</dt><dd>{log.ip || '—'}</dd></div>
            <div><dt>Değişiklik</dt><dd><pre>{log.data ? JSON.stringify(log.data, null, 2) : '—'}</pre></dd></div>
          </dl>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function formatDate(value) {
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value))
}

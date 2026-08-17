import { useMemo, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatValue } from '../utils/formatters'

export function BomStudioTable({
  rows,
  expandedIds,
  onToggle,
  onVariantOpen,
  updatingRowId,
  extraDraft,
  extraLoading,
  onExtraStart,
  onExtraCancel,
  onExtraStockOpen,
  onExtraVariantOpen,
  onExtraQuantityChange,
  onExtraPriceChange,
  onExtraSubmit,
  onExtraEdit,
  onExtraRemove,
}) {
  const [selectedId, setSelectedId] = useState('')
  const extraParentId = extraDraft?.parent.treeId

  const visibleRows = useMemo(
    () => numberRows(flattenTree(rows, expandedIds, extraParentId)),
    [expandedIds, extraParentId, rows],
  )
  const totalCost = rows.reduce(
    (total, row) => total + (Number(row.ANA_MALIYET) || 0),
    0,
  )
  const currency = rows[0]?.DOVIZ_BIRIMI

  if (!rows.length) {
    return (
      <Card className="bom-empty-card" size="sm">
        <CardHeader>
          <CardTitle>Ürün ağacı</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="bom-studio">
      <div className="bom-workbench">
        <Card className="bom-table-card" size="sm">
          <CardHeader>
            <CardTitle>Ağaç satırları</CardTitle>
            <CardAction className="bom-total-cost">
              <span>Toplam Maliyet:</span>
              <output aria-live="polite">
                {formatValue(totalCost)} {formatValue(currency)}
              </output>
            </CardAction>
          </CardHeader>
          <CardContent className="bom-table-content">
            <ScrollArea className="bom-table-scroll">
              <Table className="bom-modern-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Satır</TableHead>
                    <TableHead>Stok Kodu</TableHead>
                    <TableHead>Stok Adı</TableHead>
                    <TableHead>Varyant Kodu</TableHead>
                    <TableHead>Varyant Adı</TableHead>
                    <TableHead className="align-right">Miktar</TableHead>
                    <TableHead>Birim</TableHead>
                    <TableHead className="align-right">Birim Fiyat</TableHead>
                    <TableHead className="align-right">Tutar</TableHead>
                    <TableHead className="align-right">Ana Maliyet</TableHead>
                    <TableHead>Döviz</TableHead>
                    <TableHead className="align-right">Seviye</TableHead>
                    <TableHead className="bom-action-cell align-right">
                      İşlem
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.map((row) =>
                    row.isAddRow ? (
                      <ExtraAddRow
                        key={row.treeId}
                        row={row}
                        draft={
                          extraDraft?.parent.treeId === row.parent.treeId
                            ? extraDraft
                            : null
                        }
                        loading={extraLoading}
                        onCancel={onExtraCancel}
                        onStockOpen={onExtraStockOpen}
                        onVariantOpen={onExtraVariantOpen}
                        onQuantityChange={onExtraQuantityChange}
                        onPriceChange={onExtraPriceChange}
                        onSubmit={onExtraSubmit}
                      />
                    ) : (
                      <TreeDataRow
                        key={row.treeId}
                        row={row}
                        rowNumber={row.rowNumber}
                        selected={selectedId === row.treeId}
                        updating={updatingRowId === row.treeId}
                        disabled={Boolean(
                          updatingRowId || extraLoading || extraDraft,
                        )}
                        onSelect={() => setSelectedId(row.treeId)}
                        onToggle={() => onToggle(row.treeId)}
                        onVariantOpen={() => onVariantOpen(row)}
                        onRemove={() => onExtraRemove(row.treeId)}
                        onEdit={() => onExtraEdit(row, row.treeParent)}
                        onExtraStart={() => onExtraStart(row.addParent)}
                      />
                    ),
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TreeDataRow({
  row,
  rowNumber,
  selected,
  updating,
  disabled,
  onSelect,
  onToggle,
  onVariantOpen,
  onRemove,
  onEdit,
  onExtraStart,
}) {
  return (
    <TableRow
      className="bom-tree-row"
      data-depth={row.depth}
      data-extra={row.isExtra || undefined}
      data-state={selected ? 'selected' : undefined}
      data-updating={updating || undefined}
      aria-busy={updating || undefined}
      onClick={onSelect}
    >
      <TableCell className="bom-line-cell">
        <div
          className="bom-line-control"
          data-has-add={row.addParent || undefined}
          style={{
            '--depth': row.depth,
            '--add-depth': Math.max(row.depth - 1, 0),
          }}
        >
          <TreeGuides row={row} />
          {row.addParent ? (
            <Button
              className="bom-inline-add"
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={(event) => {
                event.stopPropagation()
                onExtraStart()
              }}
              disabled={disabled}
              aria-label={`${formatValue(row.addParent.STOK_ADI)} altına ek bileşen ekle`}
              title="Ek bileşen ekle"
            >
              <Plus />
            </Button>
          ) : null}
          {row.hasChildren ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={(event) => {
                event.stopPropagation()
                onToggle()
              }}
              aria-label={row.expanded ? 'Satırı kapat' : 'Satırı aç'}
            >
              {row.expanded ? (
                <ChevronDown data-icon="inline-start" />
              ) : (
                <ChevronRight data-icon="inline-start" />
              )}
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
          <span className="bom-line-code">{rowNumber}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="bom-stock-code">{formatValue(row.STOK_KODU)}</span>
      </TableCell>
      <TableCell>
        <div className="bom-stock-cell">
          <div>
            <strong>{formatValue(row.STOK_ADI)}</strong>
            <span>{formatValue(row.STOK_TIP_ADI ?? row.STOK_NO)}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>{formatValue(row.VARYANT_KODU)}</TableCell>
      <TableCell>
        <div className="bom-variant-cell">
          <RowVariantSelector
            row={row}
            loading={updating}
            disabled={disabled}
            onOpen={onVariantOpen}
          />
        </div>
      </TableCell>
      <TableCell className="align-right">{formatValue(row.MIKTAR)}</TableCell>
      <TableCell>{formatValue(row.BIRIM)}</TableCell>
      <TableCell className="align-right">
        {formatValue(row.BIRIM_FIYAT)}
      </TableCell>
      <TableCell className="align-right">{formatValue(row.TUTAR)}</TableCell>
      <TableCell className="align-right">
        {formatValue(row.ANA_MALIYET)}
      </TableCell>
      <TableCell>{formatValue(row.DOVIZ_BIRIMI)}</TableCell>
      <TableCell className="bom-level-cell align-right">
        <span className="bom-level-badge">{formatValue(row.level)}</span>
      </TableCell>
      <TableCell className="bom-action-cell">
        <div className="bom-row-actions">
          {row.isExtra ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit()
                }}
                disabled={disabled}
                aria-label={`${formatValue(row.STOK_ADI)} ek bileşenini düzenle`}
                title="Ek bileşeni düzenle"
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemove()
                }}
                disabled={disabled}
                aria-label={`${formatValue(row.STOK_ADI)} ek bileşenini kaldır`}
                title="Ek bileşeni kaldır"
              >
                <Trash2 />
              </Button>
            </>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

function ExtraAddRow({
  row,
  draft,
  loading,
  onCancel,
  onStockOpen,
  onVariantOpen,
  onQuantityChange,
  onPriceChange,
  onSubmit,
}) {
  const invalidQuantity =
    draft.quantity !== '' && Number(draft.quantity) <= 0
  const invalidPrice =
    !draft.variant &&
    draft.price !== '' &&
    (!Number.isFinite(Number(draft.price)) || Number(draft.price) < 0)
  const total =
    !draft.variant &&
    !invalidQuantity &&
    !invalidPrice &&
    draft.quantity !== '' &&
    draft.price !== ''
      ? Number(draft.quantity) * Number(draft.price)
      : null
  const submitLabel = loading
    ? 'Maliyet hesaplanıyor'
    : draft.editingTreeId
      ? 'Değişiklikleri kaydet'
      : 'Ek bileşeni ekle'
  const cancelLabel = draft.editingTreeId
    ? 'Düzenlemeyi iptal et'
    : 'Ek bileşen eklemeyi iptal et'

  return (
    <TableRow
      className="bom-add-row is-editing"
      data-depth={row.depth}
      aria-busy={loading || undefined}
    >
      <TableCell className="bom-line-cell">
        <div className="bom-line-control" style={{ '--depth': row.depth }}>
          <TreeGuides row={row} />
          <span className="bom-add-node" aria-hidden="true">
            <Plus />
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="bom-stock-code">
          {formatValue(draft.stock?.STOK_KODU)}
        </span>
      </TableCell>
      <TableCell>
        <InlineLookup
          value={draft.stock?.STOK_ADI}
          placeholder="Stok kartı seç"
          label="Ek stok kartı seç"
          onOpen={onStockOpen}
          disabled={loading}
        />
      </TableCell>
      <TableCell>{formatValue(draft.variant?.VARYANT_KODU)}</TableCell>
      <TableCell>
        <InlineLookup
          value={draft.variant?.VARYANT_ADI}
          placeholder="Varyant seç (opsiyonel)"
          label="Ek stok varyantı seç (opsiyonel)"
          onOpen={onVariantOpen}
          disabled={loading || !draft.stock}
        />
      </TableCell>
      <TableCell>
        <Input
          className="bom-extra-quantity"
          type="number"
          min="0.01"
          step="any"
          value={draft.quantity}
          onChange={(event) => onQuantityChange(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          disabled={loading}
          aria-label="Ek bileşen miktarı"
          aria-invalid={invalidQuantity}
        />
      </TableCell>
      <TableCell>{formatValue(draft.unit)}</TableCell>
      <TableCell>
        <Input
          className="bom-extra-price"
          type="number"
          min="0"
          step="any"
          value={draft.price}
          placeholder={draft.variant ? 'Otomatik' : undefined}
          onChange={(event) => onPriceChange(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          disabled={loading || Boolean(draft.variant)}
          aria-label="Ek bileşen birim fiyatı"
          aria-invalid={invalidPrice}
        />
      </TableCell>
      <TableCell className="align-right">{formatValue(total)}</TableCell>
      <TableCell className="align-right">{formatValue(total)}</TableCell>
      <TableCell>{formatValue(row.parent.DOVIZ_BIRIMI)}</TableCell>
      <TableCell className="bom-level-cell align-right">
        <span className="bom-level-badge">{formatValue(row.depth)}</span>
      </TableCell>
      <TableCell className="bom-action-cell">
        <div className="bom-extra-actions">
          <Button
            type="button"
            size="icon-xs"
            onClick={onSubmit}
            disabled={loading}
            aria-label={submitLabel}
            title={submitLabel}
          >
            {loading ? <LoaderCircle className="loading-icon" /> : <Check />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onCancel}
            disabled={loading}
            aria-label={cancelLabel}
            title="Vazgeç"
          >
            <X />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function InlineLookup({ value, placeholder, label, onOpen, disabled }) {
  return (
    <InputGroup
      className="bom-inline-selector"
      onClick={(event) => event.stopPropagation()}
    >
      <InputGroupInput
        value={value ?? ''}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
        aria-label={label}
        onClick={onOpen}
      />
      <InputGroupAddon>
        <InputGroupButton
          onClick={onOpen}
          disabled={disabled}
          title={label}
          aria-label={label}
        >
          <Ellipsis />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

function TreeGuides({ row }) {
  if (!row.branchColumns.length) return null

  return (
    <span className="bom-tree-guides" aria-hidden="true">
      {row.branchColumns.map((branch, branchIndex) => (
        <span
          key={`${row.treeId}-branch-${branchIndex}`}
          className={[
            'bom-tree-guide',
            branch.current ? 'is-current' : '',
            branch.continues ? 'continues' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ))}
    </span>
  )
}

function RowVariantSelector({ row, loading, disabled, onOpen }) {
  const selectorDisabled = disabled || !row.STOK_NO
  const label = row.VARYANT_ADI
    ? `${row.VARYANT_ADI} varyantını değiştir`
    : 'Satır varyantı seç'

  return (
    <InputGroup
      className="bom-variant-selector"
      data-loading={loading || undefined}
      onClick={(event) => event.stopPropagation()}
    >
      <InputGroupInput
        value={row.VARYANT_ADI ?? '--- ---'}
        placeholder="Varyant seç"
        readOnly
        disabled={selectorDisabled}
        aria-label={label}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen()
          }
        }}
      />
      <InputGroupAddon>
        <InputGroupButton
          onClick={onOpen}
          disabled={selectorDisabled}
          title={label}
          aria-label={label}
        >
          {loading ? (
            <LoaderCircle className="loading-icon" data-icon="inline-start" />
          ) : (
            <Ellipsis data-icon="inline-start" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

function numberRows(rows) {
  let rowNumber = 0
  return rows.map((row) =>
    row.isAddRow ? row : { ...row, rowNumber: (rowNumber += 1) },
  )
}

function flattenTree(
  nodes,
  expandedIds,
  activeExtraParentId,
  depth = 0,
  ancestorBranches = [],
  trailingSibling = false,
  parent = null,
) {
  return nodes.flatMap((node, index) => {
    const children = node.children ?? []
    const expanded = expandedIds?.has(node.treeId) ?? true
    const hasNextSibling = index < nodes.length - 1 || trailingSibling
    const currentBranches = depth
      ? [...ancestorBranches, hasNextSibling]
      : []
    const branchColumns = currentBranches.map((continues, branchIndex) => ({
      continues,
      current: branchIndex === currentBranches.length - 1,
    }))
    const row = {
      ...node,
      depth,
      level: node.SEVIYE ?? depth,
      hasChildren: children.length > 0,
      expanded,
      branchColumns,
      addParent:
        parent &&
        index === nodes.length - 1 &&
        activeExtraParentId !== parent.treeId
          ? parent
          : null,
      treeParent: parent,
    }

    if (!children.length || !expanded) return [row]

    const childBranches = [
      ...ancestorBranches,
      ...(depth ? [hasNextSibling] : []),
    ]

    return [
      row,
      ...flattenTree(
        children,
        expandedIds,
        activeExtraParentId,
        depth + 1,
        childBranches,
        activeExtraParentId === node.treeId,
        node,
      ),
      ...(activeExtraParentId === node.treeId
        ? [
            {
              treeId: `${node.treeId}-add`,
              isAddRow: true,
              parent: node,
              depth: depth + 1,
              branchColumns: [...childBranches, false].map(
                (continues, branchIndex, branches) => ({
                  continues,
                  current: branchIndex === branches.length - 1,
                }),
              ),
            },
          ]
        : []),
    ]
  })
}

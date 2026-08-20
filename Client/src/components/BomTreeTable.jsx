import { useMemo } from 'react'
import {
  Check,
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatValue } from '../utils/formatters'
import {
  TreeTable,
  TreeTableNode,
  TreeTableSelectionColumn,
} from './tree-table/TreeTable'

export function BomTreeTable({
  rows,
  expandedIds,
  onExpandedIdsChange,
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
  const parentById = useMemo(() => indexParents(rows), [rows])
  const columns = useMemo(
    () => [
      TreeTableSelectionColumn(),
      {
        id: 'line',
        header: 'Satır',
        size: 104,
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <TreeTableNode row={row}>
            <span className="bom-line-code">{row.getDisplayIndex() + 1}</span>
          </TreeTableNode>
        ),
      },
      textColumn('stockCode', 'STOK_KODU', 'Stok Kodu', {
        cell: ({ row }) => (
          <span className="bom-stock-code">
            {formatValue(row.original.STOK_KODU)}
          </span>
        ),
      }),
      textColumn('stockName', 'STOK_ADI', 'Stok Adı', {
        size: 240,
        cell: ({ row }) => (
          <div className="bom-stock-cell">
            <div>
              <strong>{formatValue(row.original.STOK_ADI)}</strong>
              <span>
                {formatValue(
                  row.original.STOK_TIP_ADI ?? row.original.STOK_NO,
                )}
              </span>
            </div>
          </div>
        ),
      }),
      textColumn('variantCode', 'VARYANT_KODU', 'Varyant Kodu'),
      textColumn('variantName', 'VARYANT_ADI', 'Varyant Adı', {
        size: 220,
        cell: ({ row }) => (
          <RowVariantSelector
            row={row.original}
            loading={updatingRowId === row.id}
            disabled={Boolean(updatingRowId || extraLoading || extraDraft)}
            onOpen={() => onVariantOpen(row.original)}
          />
        ),
      }),
      numberColumn('quantity', 'MIKTAR', 'Miktar'),
      textColumn('unit', 'BIRIM', 'Birim'),
      numberColumn('unitPrice', 'BIRIM_FIYAT', 'Birim Fiyat'),
      numberColumn('amount', 'TUTAR', 'Tutar'),
      numberColumn('mainCost', 'ANA_MALIYET', 'Ana Maliyet'),
      textColumn('currency', 'DOVIZ_BIRIMI', 'Döviz'),
      {
        id: 'level',
        accessorFn: (row) => row.SEVIYE,
        header: 'Seviye',
        meta: { label: 'Seviye' },
        size: 82,
        cell: ({ row }) => (
          <span className="bom-level-badge">
            {formatValue(row.original.SEVIYE ?? row.depth)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'İşlem',
        meta: { label: 'İşlem' },
        size: 116,
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const disabled = Boolean(updatingRowId || extraLoading || extraDraft)
          const item = row.original

          return (
            <div className="bom-row-actions">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onExtraStart(item)}
                disabled={disabled}
                aria-label={`${formatValue(item.STOK_ADI)} altına bileşen ekle`}
                title="Alt bileşen ekle"
              >
                <Plus />
              </Button>

              {item.isExtra ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onExtraEdit(item, parentById.get(item.treeId))}
                    disabled={disabled}
                    aria-label={`${formatValue(item.STOK_ADI)} bileşenini düzenle`}
                    title="Bileşeni düzenle"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onExtraRemove(item.treeId)}
                    disabled={disabled}
                    aria-label={`${formatValue(item.STOK_ADI)} bileşenini kaldır`}
                    title="Bileşeni kaldır"
                  >
                    <Trash2 />
                  </Button>
                </>
              ) : null}
            </div>
          )
        },
      },
    ],
    [
      extraDraft,
      extraLoading,
      onExtraEdit,
      onExtraRemove,
      onExtraStart,
      onVariantOpen,
      parentById,
      updatingRowId,
    ],
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
            <TreeTable
              data={rows}
              columns={columns}
              getRowId={(row) => row.treeId}
              expandedIds={expandedIds}
              onExpandedIdsChange={onExpandedIdsChange}
              pinnedColumns={{
                start: ['select', 'line', 'stockCode'],
                end: ['actions'],
              }}
              searchPlaceholder="Ürün ağacında ara..."
              className="bom-modern-table bom-tanstack-table"
              renderAfterRow={(row, columnCount) =>
                extraDraft?.parent.treeId === row.id ? (
                  <ExtraEditorRow
                    key={`${row.id}-editor`}
                    columnCount={columnCount}
                    draft={extraDraft}
                    loading={extraLoading}
                    onCancel={onExtraCancel}
                    onStockOpen={onExtraStockOpen}
                    onVariantOpen={onExtraVariantOpen}
                    onQuantityChange={onExtraQuantityChange}
                    onPriceChange={onExtraPriceChange}
                    onSubmit={onExtraSubmit}
                  />
                ) : null
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function textColumn(id, accessorKey, label, overrides = {}) {
  return {
    id,
    accessorKey,
    header: label,
    meta: { label },
    sortFn: 'alphanumeric',
    cell: ({ getValue }) => formatValue(getValue()),
    ...overrides,
  }
}

function numberColumn(id, accessorKey, label) {
  return {
    id,
    accessorKey,
    header: label,
    meta: { label },
    sortFn: 'basic',
    cell: ({ getValue }) => (
      <span className="align-right">{formatValue(getValue())}</span>
    ),
  }
}

function RowVariantSelector({ row, loading, disabled, onOpen }) {
  const selectorDisabled = disabled || !row.STOK_NO
  const label = row.VARYANT_ADI
    ? `${row.VARYANT_ADI} varyantını değiştir`
    : 'Satır varyantı seç'

  return (
    <InputGroup className="bom-variant-selector">
      <InputGroupInput
        value={row.VARYANT_ADI ?? '--- ---'}
        readOnly
        disabled={selectorDisabled}
        aria-label={label}
        onClick={onOpen}
      />
      <InputGroupAddon>
        <InputGroupButton
          onClick={onOpen}
          disabled={selectorDisabled}
          title={label}
          aria-label={label}
        >
          {loading ? <LoaderCircle className="loading-icon" /> : <Ellipsis />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

function ExtraEditorRow({
  columnCount,
  draft,
  loading,
  onCancel,
  onStockOpen,
  onVariantOpen,
  onQuantityChange,
  onPriceChange,
  onSubmit,
}) {
  const invalidQuantity = draft.quantity !== '' && Number(draft.quantity) <= 0
  const invalidPrice =
    !draft.variant &&
    draft.price !== '' &&
    (!Number.isFinite(Number(draft.price)) || Number(draft.price) < 0)

  return (
    <TableRow className="bom-add-row is-editing">
      <TableCell colSpan={columnCount}>
        <FieldGroup className="bom-tree-editor">
          <Field>
            <FieldLabel>Stok</FieldLabel>
            <Button type="button" variant="outline" onClick={onStockOpen} disabled={loading}>
              <Ellipsis data-icon="inline-start" />
              {draft.stock?.STOK_ADI ?? 'Stok kartı seç'}
            </Button>
          </Field>
          <Field>
            <FieldLabel>Varyant</FieldLabel>
            <Button
              type="button"
              variant="outline"
              onClick={onVariantOpen}
              disabled={loading || !draft.stock}
            >
              <Ellipsis data-icon="inline-start" />
              {draft.variant?.VARYANT_ADI ?? 'Varyant seç (opsiyonel)'}
            </Button>
          </Field>
          <Field data-invalid={invalidQuantity || undefined}>
            <FieldLabel htmlFor="tree-extra-quantity">Miktar</FieldLabel>
            <Input
              id="tree-extra-quantity"
              type="number"
              min="0.01"
              step="any"
              value={draft.quantity}
              onChange={(event) => onQuantityChange(event.target.value)}
              disabled={loading}
              aria-invalid={invalidQuantity}
            />
          </Field>
          <Field data-invalid={invalidPrice || undefined}>
            <FieldLabel htmlFor="tree-extra-price">Birim fiyat</FieldLabel>
            <Input
              id="tree-extra-price"
              type="number"
              min="0"
              step="any"
              value={draft.price}
              placeholder={draft.variant ? 'Otomatik' : undefined}
              onChange={(event) => onPriceChange(event.target.value)}
              disabled={loading || Boolean(draft.variant)}
              aria-invalid={invalidPrice}
            />
          </Field>
          <div className="bom-tree-editor-actions">
            <Button type="button" onClick={onSubmit} disabled={loading}>
              {loading ? (
                <LoaderCircle className="loading-icon" data-icon="inline-start" />
              ) : (
                <Check data-icon="inline-start" />
              )}
              {draft.editingTreeId ? 'Kaydet' : 'Ekle'}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              <X data-icon="inline-start" />
              Vazgeç
            </Button>
          </div>
        </FieldGroup>
      </TableCell>
    </TableRow>
  )
}

function indexParents(nodes, parent = null, result = new Map()) {
  for (const node of nodes) {
    if (parent) result.set(node.treeId, parent)
    indexParents(node.children ?? [], node, result)
  }
  return result
}

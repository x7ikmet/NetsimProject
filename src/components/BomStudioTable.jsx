import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Ellipsis,
  LoaderCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
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
}) {
  const [selectedId, setSelectedId] = useState('')

  const visibleRows = useMemo(
    () => flattenTree(rows, expandedIds),
    [expandedIds, rows],
  )

  if (!rows.length) {
    return (
      <Card className="bom-empty-card" size="sm">
        <CardHeader>
          <CardTitle>Ürün ağacı görünümü</CardTitle>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.map((row, rowIndex) => (
                      <TableRow
                        key={row.treeId}
                        className="bom-tree-row"
                        data-depth={row.depth}
                        data-state={selectedId === row.treeId ? 'selected' : undefined}
                        data-updating={
                          updatingRowId === row.treeId ? true : undefined
                        }
                        aria-busy={
                          updatingRowId === row.treeId ? true : undefined
                        }
                        onClick={() => setSelectedId(row.treeId)}
                      >
                        <TableCell className="bom-line-cell">
                          <div
                            className="bom-line-control"
                            style={{ '--depth': row.depth }}
                          >
                            {row.branchColumns.length ? (
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
                            ) : null}
                            {row.hasChildren ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onToggle(row.treeId)
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
                              <span className="" aria-hidden="true" />
                            )}
                            <span className="bom-line-code">{rowIndex + 1}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="bom-stock-code">
                            {formatValue(row.STOK_KODU)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div
                            className="bom-stock-cell"
                            style={{ '--depth': row.depth }}
                          >
                            <div>
                              <strong>{formatValue(row.STOK_ADI)}</strong>
                              <span>
                                {formatValue(row.STOK_TIP_ADI ?? row.STOK_NO)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>{formatValue(row.VARYANT_KODU)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="bom-variant-cell">
                            <RowVariantSelector
                              row={row}
                              loading={updatingRowId === row.treeId}
                              disabled={Boolean(updatingRowId)}
                              onOpen={() => onVariantOpen(row)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="align-right">
                          {formatValue(row.MIKTAR)}
                        </TableCell>
                        <TableCell>{formatValue(row.BIRIM)}</TableCell>
                        <TableCell className="align-right">
                          {formatValue(row.BIRIM_FIYAT)}
                        </TableCell>
                        <TableCell className="align-right">
                          {formatValue(row.TUTAR)}
                        </TableCell>
                        <TableCell className="align-right">
                          {formatValue(row.ANA_MALIYET)}
                        </TableCell>
                        <TableCell>{formatValue(row.DOVIZ_BIRIMI)}</TableCell>
                        <TableCell className="bom-level-cell align-right">
                          <span className="bom-level-badge">
                            {formatValue(row.level)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
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

function flattenTree(nodes, expandedIds, depth = 0, ancestorBranches = []) {
  return nodes.flatMap((node, index) => {
    const children = node.children ?? []
    const expanded = expandedIds?.has(node.treeId) ?? true
    const hasNextSibling = index < nodes.length - 1
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
    }

    if (!children.length || !expanded) return [row]

    return [
      row,
      ...flattenTree(children, expandedIds, depth + 1, [
        ...ancestorBranches,
        ...(depth ? [hasNextSibling] : []),
      ]),
    ]
  })
}

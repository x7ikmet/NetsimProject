import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatValue } from '../utils/formatters'

export function BomStudioTable({ rows, expandedIds, onToggle, emptyText }) {
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
          <CardDescription>{emptyText}</CardDescription>
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
                    <TableHead className="align-right">Maliyet</TableHead>
                    <TableHead className="align-right">Seviye</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.length ? (
                    visibleRows.map((row, rowIndex) => (
                      <TableRow
                        key={row.treeId}
                        className="bom-tree-row"
                        data-depth={row.depth}
                        data-state={selectedId === row.treeId ? 'selected' : undefined}
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
                            <span>{formatValue(row.VARYANT_ADI)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="align-right">
                          {formatValue(row.MIKTAR)}
                        </TableCell>
                        <TableCell>{formatValue(row.BIRIM)}</TableCell>
                        <TableCell className="align-right">
                          {formatValue(row.TUTAR)}
                        </TableCell>
                        <TableCell className="bom-level-cell align-right">
                          <span className="bom-level-badge">
                            {formatValue(row.level)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div className="bom-no-results">BOM satırı bulunamadı.</div>
                      </TableCell>
                    </TableRow>
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

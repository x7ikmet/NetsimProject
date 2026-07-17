import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import { formatValue } from '../utils/formatters'

export function BomStudioTable({
  rows,
  expandedIds,
  onToggle,
  emptyText,
}) {
  const [selectedId, setSelectedId] = useState('')

  const allRows = useMemo(() => flattenTree(rows), [rows])
  const maxDepth = useMemo(
    () => allRows.reduce((max, row) => Math.max(max, row.depth), 0),
    [allRows],
  )

  const sourceRows = flattenTree(rows, expandedIds)

  const visibleRows = useMemo(
    () => sourceRows.filter((row) => row.depth <= maxDepth),
    [maxDepth, sourceRows],
  )

  const selectedRow =
    allRows.find((row) => row.treeId === selectedId) ?? visibleRows[0] ?? null

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
    <TooltipProvider>
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
                      <TableHead>Stok</TableHead>
                      <TableHead>Varyant</TableHead>
                      <TableHead className="align-right">Miktar</TableHead>
                      <TableHead>Birim</TableHead>
                      <TableHead className="align-right">Maliyet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.length ? (
                      visibleRows.map((row, rowIndex) => (
                        <TableRow
                          key={row.treeId}
                          data-state={selectedRow?.treeId === row.treeId ? 'selected' : undefined}
                          onClick={() => setSelectedId(row.treeId)}
                        >
                          <TableCell className="bom-line-cell">
                            <span className="bom-line-code">{rowIndex + 1}</span>
                          </TableCell>
                          <TableCell>
                            <div className="bom-stock-cell" style={{ '--depth': row.depth }}>
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
                                <span className="bom-toggle-spacer" aria-hidden="true" />
                              )}
                              <div>
                                <strong>{formatValue(row.STOK_ADI)}</strong>
                                <span>{formatValue(row.STOK_TIP_ADI)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="bom-variant-cell">
                              <Badge variant={row.depth === 0 ? 'default' : 'outline'}>
                                {formatValue(row.STOK_VARYANT_NO)}
                              </Badge>
                              <span>{formatValue(row.ACIKLAMA)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="align-right">{formatValue(row.MIKTAR)}</TableCell>
                          <TableCell>{formatValue(row.BIRIM)}</TableCell>
                          <TableCell className="align-right">{formatValue(row.TUTAR)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6}>
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
    </TooltipProvider>
  )
}

function flattenTree(nodes, expandedIds, depth = 0, prefix = '') {
  return nodes.flatMap((node, index) => {
    const path = prefix ? `${prefix}.${node.rowNo ?? index + 1}` : `${node.rowNo ?? index + 1}`
    const children = node.children ?? []
    const expanded = expandedIds?.has(node.treeId) ?? true
    const row = {
      ...node,
      depth,
      path,
      hasChildren: children.length > 0,
      expanded,
      searchText: [
        node.STOK_TIP_ADI,
        node.STOK_NO,
        node.STOK_ADI,
        node.STOK_VARYANT_NO,
        node.ACIKLAMA,
        node.BIRIM,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('tr-TR'),
    }

    if (!children.length || !expanded) return [row]

    return [row, ...flattenTree(children, expandedIds, depth + 1, path)]
  })
}

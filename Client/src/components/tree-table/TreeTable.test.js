import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { getProductTreePdfColumns } from '../productTreePdfColumns.js'

const vite = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})
const {
  TreeTable,
  TreeTableNode,
  TreeTableSelectionColumn,
} = await vite.ssrLoadModule('/src/components/tree-table/TreeTable.jsx')
const { updateTreeSelection } = await vite.ssrLoadModule(
  '/src/components/tree-table/treeSelection.js',
)
after(() => vite.close())

test('expanded tree rows render with selection and hierarchy', () => {
  const columns = [
    TreeTableSelectionColumn(),
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row, getValue }) =>
        React.createElement(TreeTableNode, { row }, getValue()),
    },
  ]
  const html = renderToString(
    React.createElement(TreeTable, {
      data: [
        {
          id: 'root',
          name: 'Root',
          children: [{ id: 'child', name: 'Child', children: [] }],
        },
      ],
      columns,
      getRowId: (row) => row.id,
      expandedIds: new Set(['root']),
    }),
  )

  assert.match(html, /Root/)
  assert.match(html, /Child/)
  assert.match(html, /0(?:<!-- -->)? satır seçili/)
  assert.match(html, /Tüm satırları seç/)
})

test('selecting a tree row includes every descendant', () => {
  const child = { id: 'child', subRows: [], getCanSelect: () => true }
  const parent = {
    id: 'parent',
    subRows: [child],
    getCanSelect: () => true,
  }

  const selected = updateTreeSelection({}, parent, true)
  assert.deepEqual(selected, { parent: true, child: true })
  assert.deepEqual(updateTreeSelection(selected, parent, false), {})
})

test('PDF columns follow visible tree-table columns', () => {
  const columns = getProductTreePdfColumns(['line', 'stockName', 'amount'])

  assert.deepEqual(
    columns.map((column) => column.id),
    ['line', 'stockName', 'amount'],
  )
  assert.equal(
    Math.round(columns.reduce((total, column) => total + column.width, 0)),
    792,
  )
})

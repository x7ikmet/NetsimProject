import { getProductTreeV2 } from '../api/stokApi'

export async function buildProductTree({ stokVaryantNo, birim, miktar }) {
  if (!stokVaryantNo) return []

  const rows = await getProductTreeV2({ stokVaryantNo, birim, miktar })
  if (!rows.length) return []

  const normalizeLevel = (value) => {
    const level = Number(value)
    return Number.isFinite(level) && level >= 0 ? level : 0
  }
  const roots = []
  const stack = []

  rows.forEach((row, index) => {
    const level = normalizeLevel(row.SEVIYE)
    const parent = level > 0 ? stack[level - 1] : null
    const siblings = parent ? parent.children : roots
    const node = {
      ...row,
      STOK_ADI: row.STOK_ADI ?? row.KART_STOK_ADI,
      ACIKLAMA: row.ACIKLAMA ?? row.VARYANT_ADI,
      rowNo: siblings.length + 1,
      treeId: [
        'tree',
        row.TREE_PATH ?? '',
        row.STOK_DETAY_NO ?? 'root',
        row.STOK_VARYANT_NO ?? 'none',
        index,
      ].join('-'),
      children: [],
    }

    siblings.push(node)
    stack[level] = node
    stack.length = level + 1
  })

  return prioritizeParents(roots)
}

export function collectExpandableIds(nodes) {
  return nodes.flatMap((node) => {
    if (!node.children?.length) return []
    return [node.treeId, ...collectExpandableIds(node.children)]
  })
}

function prioritizeParents(nodes) {
  return nodes
    .map(({ children, ...node }) =>
      children.length
        ? { ...node, children: prioritizeParents(children) }
        : node,
    )
    .sort(
      (a, b) =>
        Number(Boolean(b.children?.length)) - Number(Boolean(a.children?.length)),
    )
}

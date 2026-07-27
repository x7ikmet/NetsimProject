import { getProductTree } from '../api/stokApi'

export function createRootTreeNode(selectedStock, selectedVariant, children) {
  const root = {
    treeId: `root-${selectedVariant.STOK_VARYANT_NO}`,
    rowNo: 1,
    STOK_TIP_ADI: selectedStock?.STOK_TIP_ADI,
    STOK_NO: selectedStock?.STOK_NO,
    STOK_KODU: selectedStock?.STOK_KODU,
    STOK_ADI: selectedStock?.STOK_ADI,
    STOK_VARYANT_NO: selectedVariant.STOK_VARYANT_NO,
    VARYANT_KODU: selectedVariant.VARYANT_KODU,
    VARYANT_ADI: selectedVariant.VARYANT_ADI,
    ACIKLAMA: selectedVariant.VARYANT_ADI,
    MIKTAR: selectedVariant.MIKTAR,
    MIKTAR1: selectedVariant.MIKTAR,
    BIRIM: selectedVariant.BIRIM,
  }

  return children.length ? { ...root, children } : root
}

export async function buildProductTree(variantNo) {
  if (!variantNo) return []

  const rows = await getProductTree(variantNo)
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

  const root = roots.find(
    (node) =>
      Number(node.STOK_VARYANT_NO) === Number(variantNo) &&
      normalizeLevel(node.SEVIYE) === 0,
  )

  return prioritizeParents(root ? root.children : roots)
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

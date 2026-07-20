import { getVaryantsOfVaryant } from '../api/stokApi'

const MAX_TREE_DEPTH = 50

export function collectExpandedIds(nodes) {
  return nodes.flatMap((node) => [
    node.treeId,
    ...(node.children?.length ? collectExpandedIds(node.children) : []),
  ])
}

export function createRootTreeNode(selectedStock, selectedVariant, children) {
  return withChildren(
    {
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
    },
    children,
  )
}

export async function buildProductTree(variantNo, path = new Set(), depth = 0) {
  if (!variantNo || path.has(variantNo) || depth > MAX_TREE_DEPTH) {
    return []
  }

  const nextPath = new Set(path)
  nextPath.add(variantNo)

  const rows = await getVaryantsOfVaryant(variantNo)

  return Promise.all(
    rows.map(async (row, index) => {
      const childVariantNo = Number(row.STOK_VARYANT_NO)
      const canLoadChildren = childVariantNo > 0 && !nextPath.has(childVariantNo)
      const children = canLoadChildren
        ? await buildProductTree(childVariantNo, nextPath, depth + 1)
        : []

      return withChildren(
        normalizeProductTreeRow({
          ...row,
          rowNo: row.SIRA_NO ?? index + 1,
          treeId: `${variantNo}-${row.STOK_DETAY_NO ?? index}-${childVariantNo}`,
        }),
        children,
      )
    }),
  )
}

function normalizeProductTreeRow(row) {
  return {
    ...row,
    STOK_ADI: row.STOK_ADI ?? row.KART_STOK_ADI,
    ACIKLAMA: row.ACIKLAMA ?? row.VARYANT_ADI,
  }
}

function withChildren(row, children) {
  if (!children?.length) {
    return row
  }

  return { ...row, children }
}

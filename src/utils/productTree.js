import { getProductTreeV3 } from '../api/stokApi'

export async function buildProductTree({
  stokVaryantNo,
  stokNo,
  birim,
  miktar,
  maliyetYontemi,
}) {
  if (!stokVaryantNo) return []

  const rows = await getProductTreeV3({
    stokVaryantNo,
    stokNo,
    birim,
    miktar,
    maliyetYontemi,
  })
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

export function replaceTreeVariant(nodes, treeId, replacement) {
  let replaced = false
  let costDelta = 0

  const nextNodes = nodes.map((node) => {
    if (node.treeId === treeId) {
      const nextNode = rebaseReplacementTree(node, replacement)
      replaced = true
      costDelta =
        getNumericCost(nextNode.ANA_MALIYET) -
        getNumericCost(node.ANA_MALIYET)
      return nextNode
    }

    if (!node.children?.length) return node

    const childResult = replaceTreeVariant(node.children, treeId, replacement)
    if (!childResult.replaced) return node

    replaced = true
    costDelta = childResult.costDelta

    return {
      ...node,
      ANA_MALIYET: applyCostDelta(node.ANA_MALIYET, costDelta),
      children: childResult.nodes,
    }
  })

  return { nodes: nextNodes, replaced, costDelta }
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

function rebaseReplacementTree(currentNode, replacement) {
  const currentLevel = normalizeTreeLevel(currentNode.SEVIYE)

  return {
    ...replacement,
    STOK_DETAY_NO: currentNode.STOK_DETAY_NO,
    ANA_STOK_VARYANT_NO: currentNode.ANA_STOK_VARYANT_NO,
    TREE_PATH: currentNode.TREE_PATH,
    treeId: currentNode.treeId,
    SEVIYE: currentLevel,
    children: rebaseReplacementChildren(
      replacement.children ?? [],
      currentNode.treeId,
      currentLevel + 1,
    ),
  }
}

function rebaseReplacementChildren(nodes, parentTreeId, level) {
  return nodes.map((node, index) => {
    const treeId = [
      parentTreeId,
      'variant',
      node.STOK_DETAY_NO ?? node.STOK_VARYANT_NO ?? index,
      index,
    ].join('-')

    return {
      ...node,
      treeId,
      SEVIYE: level,
      children: rebaseReplacementChildren(
        node.children ?? [],
        treeId,
        level + 1,
      ),
    }
  })
}

function normalizeTreeLevel(value) {
  const level = Number(value)
  return Number.isFinite(level) && level >= 0 ? level : 0
}

function getNumericCost(value) {
  const cost = Number(value)
  return Number.isFinite(cost) ? cost : 0
}

function applyCostDelta(value, delta) {
  const cost = Number(value)
  return Number.isFinite(cost) ? cost + delta : value
}

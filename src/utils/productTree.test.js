import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'

const vite = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})
const {
  appendTreeChild,
  buildProductTree,
  getTreeTotalCost,
  removeExtraTreeNode,
  replaceTreeVariant,
} = await vite.ssrLoadModule('/src/utils/productTree.js')

after(() => vite.close())

test('parents inherit child currency after build and variant replacement', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      data: {
        dataset: [
          { SEVIYE: 0, ANA_MALIYET: 10 },
          { SEVIYE: 1, ANA_MALIYET: 10 },
          { SEVIYE: 2, ANA_MALIYET: 10, DOVIZ_BIRIMI: 'USD' },
        ],
      },
    }),
  })

  try {
    const [root] = await buildProductTree({ stokVaryantNo: 1 })
    assert.equal(root.DOVIZ_BIRIMI, 'USD')
    assert.equal(root.children[0].DOVIZ_BIRIMI, 'USD')

    const target = root.children[0]
    const [updatedRoot] = replaceTreeVariant([root], target.treeId, {
      ...target,
      DOVIZ_BIRIMI: 'EUR',
      children: [],
    }).nodes

    assert.equal(updatedRoot.DOVIZ_BIRIMI, 'EUR')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('extra children update ancestor costs and can be removed', () => {
  const tree = [
    {
      treeId: 'root',
      SEVIYE: 0,
      STOK_VARYANT_NO: 1,
      ANA_MALIYET: 100,
      DOVIZ_BIRIMI: 'TL',
      children: [
        {
          treeId: 'parent',
          SEVIYE: 1,
          STOK_VARYANT_NO: 2,
          ANA_MALIYET: 40,
          DOVIZ_BIRIMI: 'TL',
          children: [],
        },
      ],
    },
  ]
  const variantTree = {
    STOK_KODU: 'EXTRA-1',
    STOK_VARYANT_NO: 3,
    MIKTAR: 2,
    ANA_MALIYET: 999,
    DOVIZ_BIRIMI: 'TL',
    children: [
      { STOK_KODU: 'CHILD-1', ANA_MALIYET: 5, children: [] },
      { STOK_KODU: 'CHILD-2', ANA_MALIYET: 7, children: [] },
    ],
  }
  const calculatedTotal = getTreeTotalCost(variantTree)
  const extra = {
    ...variantTree,
    BIRIM_FIYAT: calculatedTotal / variantTree.MIKTAR,
    TUTAR: calculatedTotal,
    ANA_MALIYET: calculatedTotal,
  }

  assert.equal(calculatedTotal, 12)
  assert.equal(getTreeTotalCost({ ANA_MALIYET: 12, children: [] }), 12)

  const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: {},
  })
  let added
  try {
    added = appendTreeChild(tree, 'parent', extra)
  } finally {
    Object.defineProperty(globalThis, 'crypto', originalCrypto)
  }
  const addedRoot = added.nodes[0]
  const addedParent = addedRoot.children[0]
  const addedChild = addedParent.children[0]

  assert.equal(added.appended, true)
  assert.equal(addedRoot.ANA_MALIYET, 112)
  assert.equal(addedParent.ANA_MALIYET, 52)
  assert.equal(addedChild.SEVIYE, 2)
  assert.equal(addedChild.STOK_VARYANT_NO, 3)
  assert.equal(addedChild.BIRIM_FIYAT, 6)
  assert.equal(addedChild.TUTAR, 12)
  assert.equal(addedChild.children.length, 2)
  assert.equal(addedChild.children[0].SEVIYE, 3)
  assert.equal(addedChild.isExtra, true)
  assert.equal(addedChild.treeId, added.childId)

  const edited = replaceTreeVariant(added.nodes, added.childId, {
    ...extra,
    BIRIM_FIYAT: 8,
    TUTAR: 16,
    ANA_MALIYET: 16,
    children: [
      { STOK_KODU: 'CHILD-1', ANA_MALIYET: 6, children: [] },
      { STOK_KODU: 'CHILD-2', ANA_MALIYET: 10, children: [] },
    ],
  })
  assert.equal(edited.replaced, true)
  assert.equal(edited.nodes[0].ANA_MALIYET, 116)
  assert.equal(edited.nodes[0].children[0].ANA_MALIYET, 56)
  assert.equal(edited.nodes[0].children[0].children[0].BIRIM_FIYAT, 8)
  assert.equal(edited.nodes[0].children[0].children[0].isExtra, true)

  const removed = removeExtraTreeNode(edited.nodes, added.childId)
  assert.equal(removed.removed, true)
  assert.equal(removed.nodes[0].ANA_MALIYET, 100)
  assert.equal(removed.nodes[0].children[0].ANA_MALIYET, 40)
  assert.equal(removed.nodes[0].children[0].children.length, 0)
})

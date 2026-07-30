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
  const extra = {
    STOK_VARYANT_NO: 3,
    ANA_MALIYET: 12,
    DOVIZ_BIRIMI: 'TL',
    children: [{ STOK_VARYANT_NO: 4, ANA_MALIYET: 12, children: [] }],
  }

  const added = appendTreeChild(tree, 'parent', extra)
  const addedRoot = added.nodes[0]
  const addedParent = addedRoot.children[0]
  const addedChild = addedParent.children[0]

  assert.equal(added.appended, true)
  assert.equal(addedRoot.ANA_MALIYET, 112)
  assert.equal(addedParent.ANA_MALIYET, 52)
  assert.equal(addedChild.SEVIYE, 2)
  assert.equal(addedChild.children[0].SEVIYE, 3)
  assert.equal(addedChild.isExtra, true)
  assert.equal(addedChild.treeId, added.childId)

  const removed = removeExtraTreeNode(added.nodes, added.childId)
  assert.equal(removed.removed, true)
  assert.equal(removed.nodes[0].ANA_MALIYET, 100)
  assert.equal(removed.nodes[0].children[0].ANA_MALIYET, 40)
  assert.equal(removed.nodes[0].children[0].children.length, 0)
})

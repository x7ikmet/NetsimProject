import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'

const vite = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})
const { buildProductTree, replaceTreeVariant } = await vite.ssrLoadModule(
  '/src/utils/productTree.js',
)

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

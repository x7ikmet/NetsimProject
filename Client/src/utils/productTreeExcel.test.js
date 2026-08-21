import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'
import { read, utils, write } from 'xlsx'

const vite = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})
const { createProductTreeWorkbook } = await vite.ssrLoadModule(
  '/src/utils/productTreeExcel.js',
)

after(() => vite.close())

test('Excel export preserves hierarchy and numeric values', () => {
  const workbook = createProductTreeWorkbook(
    [
      {
        treeId: 'root',
        STOK_KODU: 'ROOT',
        STOK_ADI: 'Ana Ürün',
        MIKTAR: 2,
        ANA_MALIYET: 25.5,
        DOVIZ_BIRIMI: 'TL',
        children: [
          {
            treeId: 'child',
            STOK_KODU: 'CHILD',
            STOK_ADI: 'Parça',
            MIKTAR: 3,
            ANA_MALIYET: 7.25,
            children: [],
          },
        ],
      },
    ],
    null,
    {
      stock: 'ROOT - Ana Ürün',
      variant: 'V1 - Standart',
      quantity: 2,
      unit: 'Adet',
      costMethod: 'Son Alış Fiyatı',
    },
  )
  const exported = write(workbook, { bookType: 'xlsx', type: 'buffer' })
  const savedWorkbook = read(exported, { cellStyles: true })
  const sheet = savedWorkbook.Sheets['Ürün Ağacı']
  const rows = utils.sheet_to_json(sheet, { header: 1 })

  assert.deepEqual(rows[4], ['Toplam Maliyet', 25.5, 'TL'])
  assert.equal(sheet.B5.f, 'SUM(J8)')
  assert.equal(rows[7][1], 'ROOT')
  assert.equal(rows[8][2], '  Parça')
  assert.equal(rows[8][5], 3)
  assert.equal(rows[8][9], 7.25)
  assert.equal(sheet['!rows'][8].level, 1)
})

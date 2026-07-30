import { useState } from 'react'
import { FileDown, LoaderCircle, Search } from 'lucide-react'
import './App.css'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getStokKartlar, getVaryantsByStokId } from './api/stokApi'
import { LookupDialog } from './components/LookupDialog'
import { BomStudioTable } from './components/BomStudioTable'
import { SelectorField } from './components/SelectorField'
import { costMethods } from './config/productTree'
import { stockColumns, variantColumns } from './config/tableColumns'
import { getStockLabel, getVariantLabel } from './utils/formatters'
import {
  appendTreeChild,
  buildProductTree,
  collectExpandableIds,
  removeExtraTreeNode,
  replaceTreeVariant,
} from './utils/productTree'

const initialLoadingState = {
  stocks: false,
  variants: false,
  rowVariants: false,
  extraVariants: false,
  extraTree: false,
  tree: false,
}

function App() {
  const [stocks, setStocks] = useState([])
  const [variants, setVariants] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [rowVariants, setRowVariants] = useState([])
  const [editingRow, setEditingRow] = useState(null)
  const [rowVariantDialogOpen, setRowVariantDialogOpen] = useState(false)
  const [updatingRowId, setUpdatingRowId] = useState('')
  const [extraDraft, setExtraDraft] = useState(null)
  const [extraVariants, setExtraVariants] = useState([])
  const [extraDialog, setExtraDialog] = useState('')
  const [tree, setTree] = useState([])
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [loading, setLoading] = useState(initialLoadingState)
  const [message, setMessage] = useState('')
  const [unit, setUnit] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [costMethod, setCostMethod] = useState(costMethods[0].value)
  const [treeCostMethod, setTreeCostMethod] = useState('')

  async function openStockDialog() {
    setMessage('')
    setStockDialogOpen(true)

    if (stocks.length) return

    await loadStocks()
  }

  async function openVariantDialog() {
    setMessage('')

    if (!selectedStock) {
      setMessage('Önce stok kartı seçiniz.')
      return
    }

    setVariantDialogOpen(true)
    await loadVariants(selectedStock.STOK_NO)
  }

  async function loadStocks() {
    setLoadingField('stocks', true)
    try {
      setStocks(await getStokKartlar())
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoadingField('stocks', false)
    }
  }

  async function loadVariants(stokNo) {
    setLoadingField('variants', true)
    try {
      setVariants(await getVaryantsByStokId(stokNo))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoadingField('variants', false)
    }
  }

  async function openRowVariantDialog(row) {
    setMessage('')

    if (!row.STOK_NO) {
      setMessage('Bu satır için stok numarası bulunamadı.')
      return
    }

    setEditingRow(row)
    setRowVariants([])
    setRowVariantDialogOpen(true)
    setLoadingField('rowVariants', true)

    try {
      setRowVariants(await getVaryantsByStokId(row.STOK_NO))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoadingField('rowVariants', false)
    }
  }

  function closeRowVariantDialog() {
    setRowVariantDialogOpen(false)
    setEditingRow(null)
    setRowVariants([])
  }

  async function selectRowVariant(variant) {
    const targetRow = editingRow
    if (!targetRow) return

    closeRowVariantDialog()

    if (
      String(variant.STOK_VARYANT_NO) === String(targetRow.STOK_VARYANT_NO)
    ) {
      return
    }

    const rowQuantity = Number(targetRow.MIKTAR)
    const rowUnit = String(targetRow.BIRIM ?? '').trim()

    if (!Number.isFinite(rowQuantity) || rowQuantity <= 0 || !rowUnit) {
      setMessage('Satırın miktar veya birim bilgisi maliyet hesabı için geçersiz.')
      return
    }

    setMessage('')
    setUpdatingRowId(targetRow.treeId)

    try {
      const [replacement] = await buildProductTree({
        stokVaryantNo: variant.STOK_VARYANT_NO,
        stokNo: targetRow.STOK_NO,
        birim: rowUnit,
        miktar: rowQuantity,
        maliyetYontemi: treeCostMethod || costMethod,
      })

      if (!replacement) {
        throw new Error('Seçilen varyant için maliyet ağacı bulunamadı.')
      }

      setTree((current) => {
        const result = replaceTreeVariant(
          current,
          targetRow.treeId,
          replacement,
        )
        return result.replaced ? result.nodes : current
      })

      if (Number(targetRow.SEVIYE) === 0) {
        setSelectedVariant(variant)
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setUpdatingRowId('')
    }
  }

  function startExtraRow(parent) {
    setMessage('')
    setExtraVariants([])
    setExtraDraft({
      parent,
      stock: null,
      variant: null,
      quantity: '1',
      unit: '',
    })
  }

  function cancelExtraRow() {
    setExtraDraft(null)
    setExtraVariants([])
    setExtraDialog('')
  }

  async function openExtraStockDialog() {
    setMessage('')
    setExtraDialog('stock')
    if (!stocks.length) await loadStocks()
  }

  function selectExtraStock(stock) {
    setExtraDraft((current) => ({
      ...current,
      stock,
      variant: null,
      quantity: String(stock.MIKTAR ?? '1'),
      unit: stock.BIRIM1 ?? 'Adet',
    }))
    setExtraVariants([])
    setExtraDialog('')
  }

  async function openExtraVariantDialog() {
    if (!extraDraft?.stock) return

    setMessage('')
    setExtraVariants([])
    setExtraDialog('variant')
    setLoadingField('extraVariants', true)

    try {
      setExtraVariants(
        await getVaryantsByStokId(extraDraft.stock.STOK_NO),
      )
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoadingField('extraVariants', false)
    }
  }

  function selectExtraVariant(variant) {
    setExtraDraft((current) => ({
      ...current,
      variant,
      quantity: String(variant.MIKTAR ?? current.quantity),
      unit: variant.BIRIM ?? current.stock.BIRIM1 ?? 'Adet',
    }))
    setExtraDialog('')
  }

  async function addExtraRow() {
    if (!extraDraft?.stock || !extraDraft.variant) {
      setMessage('Ek bileşen için stok kartı ve varyant seçiniz.')
      return
    }

    const parsedQuantity = Number(extraDraft.quantity)
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setMessage('Ek bileşen miktarı sıfırdan büyük olmalıdır.')
      return
    }

    if (!extraDraft.unit) {
      setMessage('Ek bileşenin birim bilgisi bulunamadı.')
      return
    }

    setMessage('')
    setLoadingField('extraTree', true)

    try {
      const [child] = await buildProductTree({
        stokVaryantNo: extraDraft.variant.STOK_VARYANT_NO,
        stokNo: extraDraft.stock.STOK_NO,
        birim: extraDraft.unit,
        miktar: parsedQuantity,
        maliyetYontemi: treeCostMethod || costMethod,
      })

      if (!child || !Number.isFinite(Number(child.ANA_MALIYET))) {
        throw new Error('Ek bileşen için geçerli maliyet bulunamadı.')
      }

      const treeCurrency = String(tree[0]?.DOVIZ_BIRIMI ?? '').trim()
      const childCurrency = String(child.DOVIZ_BIRIMI ?? '').trim()
      if (treeCurrency && childCurrency && treeCurrency !== childCurrency) {
        throw new Error('Farklı döviz birimindeki maliyetler birleştirilemez.')
      }

      const result = appendTreeChild(
        tree,
        extraDraft.parent.treeId,
        child,
      )
      if (!result.appended) {
        throw new Error('Ek bileşenin ekleneceği üst satır bulunamadı.')
      }

      setTree(result.nodes)
      cancelExtraRow()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoadingField('extraTree', false)
    }
  }

  function removeExtraRow(treeId) {
    setTree((current) => {
      const result = removeExtraTreeNode(current, treeId)
      return result.removed ? result.nodes : current
    })
  }

  function selectStock(stock) {
    setSelectedStock(stock)
    setSelectedVariant(null)
    setVariants([])
    setUnit(stock.BIRIM1 ?? 'Adet')
    setQuantity(String(stock.MIKTAR ?? '1'))
    clearTree()
    setStockDialogOpen(false)
  }

  function selectVariant(variant) {
    setSelectedVariant(variant)
    setUnit(variant.BIRIM ?? selectedStock?.BIRIM1 ?? 'Adet')
    setQuantity(String(variant.MIKTAR ?? selectedStock?.MIKTAR ?? '1'))
    clearTree()
    setVariantDialogOpen(false)
  }

  async function findProductTree(event) {
    event.preventDefault()
    setMessage('')

    if (!selectedVariant) {
      setMessage('Ürün ağacı için stok varyantı seçiniz.')
      return
    }

    const parsedQuantity = Number(quantity)

    if (!unit.trim()) {
      setMessage('Birim bilgisini giriniz.')
      return
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setMessage('Miktar sıfırdan büyük olmalıdır.')
      return
    }

    setLoadingField('tree', true)
    try {
      const nodes = await buildProductTree({
        stokVaryantNo: selectedVariant.STOK_VARYANT_NO,
        stokNo: selectedStock.STOK_NO,
        birim: unit.trim(),
        miktar: parsedQuantity,
        maliyetYontemi: costMethod,
      })

      setTree(nodes)
      setTreeCostMethod(costMethod)
      setExpandedIds(new Set())
      cancelExtraRow()

      if (!nodes.length) {
        setMessage('Seçilen varyant için ürün ağacı kaydı bulunamadı.')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoadingField('tree', false)
    }
  }

  function toggleRow(treeId) {
    if (extraDraft?.parent.treeId === treeId) cancelExtraRow()

    setExpandedIds((current) => {
      const next = new Set(current)
      next.has(treeId) ? next.delete(treeId) : next.add(treeId)
      return next
    })
  }

  function collapseTree() {
    cancelExtraRow()
    setExpandedIds(new Set())
  }

  function expandTree() {
    setExpandedIds(new Set(collectExpandableIds(tree)))
  }

  function clearTree() {
    setTree([])
    setTreeCostMethod('')
    setExpandedIds(new Set())
    cancelExtraRow()
  }

  function setLoadingField(key, value) {
    setLoading((current) => ({ ...current, [key]: value }))
  }

  return (
    <main className="erp-page">
      <div className="page-shell">
        <header className="page-header">
          <div>
            <h1>Ürün Ağacı</h1>
          </div>
        </header>

        <form className="search-panel" onSubmit={findProductTree}>
          <FieldGroup className="search-form-card">
            <SelectorField
              className="search-stock"
              id="stock-name"
              label="Stok Adı"
              value={getStockLabel(selectedStock)}
              placeholder="Stok adı seçiniz"
              onOpen={openStockDialog}
            />

            <SelectorField
              className="search-variant"
              id="stock-variant"
              label="Stok Varyantı"
              value={getVariantLabel(selectedVariant)}
              placeholder="Stok varyantı seçiniz"
              onOpen={openVariantDialog}
              disabled={!selectedStock}
            />

            <Field className="search-unit">
              <FieldLabel htmlFor="unit">Birim</FieldLabel>
              <Input
                id="unit"
                value={unit}
                placeholder="Adet"
                readOnly
              />
            </Field>

            <Field
              className="search-quantity"
              data-invalid={
                quantity !== '' && Number(quantity) <= 0
                  ? true
                  : undefined
              }
            >
              <FieldLabel htmlFor="quantity">Miktar</FieldLabel>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                aria-invalid={quantity !== '' && Number(quantity) <= 0}
                readOnly
              />
            </Field>

            <Field className="search-cost-method">
              <FieldLabel htmlFor="cost-method">Maliyet Yöntemi</FieldLabel>
              <Select
                items={costMethods}
                value={costMethod}
                onValueChange={setCostMethod}
              >
                <SelectTrigger id="cost-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {costMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <div className="search-actions-card">
            <Button className="search-action" type="submit" disabled={loading.tree}>
              {loading.tree ? (
                <LoaderCircle className="loading-icon" data-icon="inline-start" />
              ) : (
                <Search data-icon="inline-start" />
              )}
              {loading.tree ? 'Bulunuyor...' : 'Ağacı göster'}
            </Button>

            <div className="tree-actions" role="group" aria-label="Ağaç işlemleri">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={collapseTree}
                disabled={!tree.length || loading.tree}
              >
                Daralt
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={expandTree}
                disabled={!tree.length || loading.tree}
              >
                Genişlet
              </Button>
            </div>

            <Button
              className="pdf-action"
              type="button"
              variant="outline"
              disabled
              title="PDF dışa aktarma yakında"
            >
              <FileDown data-icon="inline-start" />
              PDF Kaydet
            </Button>
          </div>
        </form>

        {message ? (
          <div className="notice" role="status">
            <span aria-hidden="true">!</span>
            {message}
          </div>
        ) : null}

        <section className="result-panel" aria-label="Ürün ağacı sonuçları">
          <BomStudioTable
            rows={tree}
            expandedIds={expandedIds}
            onToggle={toggleRow}
            onVariantOpen={openRowVariantDialog}
            updatingRowId={updatingRowId}
            extraDraft={extraDraft}
            extraLoading={loading.extraTree}
            onExtraStart={startExtraRow}
            onExtraCancel={cancelExtraRow}
            onExtraStockOpen={openExtraStockDialog}
            onExtraVariantOpen={openExtraVariantDialog}
            onExtraQuantityChange={(value) =>
              setExtraDraft((current) => ({ ...current, quantity: value }))
            }
            onExtraSubmit={addExtraRow}
            onExtraRemove={removeExtraRow}
          />
        </section>
      </div>

      {stockDialogOpen ? (
        <LookupDialog
          title="Stok Kart Seçimi"
          rows={stocks}
          columns={stockColumns}
          loading={loading.stocks}
          selectedRow={selectedStock}
          onClose={() => setStockDialogOpen(false)}
          onSelect={selectStock}
        />
      ) : null}

      {variantDialogOpen ? (
        <LookupDialog
          title="Stok Varyantı Seçimi"
          rows={variants}
          columns={variantColumns}
          loading={loading.variants}
          selectedRow={selectedVariant}
          onClose={() => setVariantDialogOpen(false)}
          onSelect={selectVariant}
        />
      ) : null}

      {rowVariantDialogOpen && editingRow ? (
        <LookupDialog
          title="Satır Varyantını Değiştir"
          description={`Stok: ${editingRow.STOK_KODU ?? editingRow.STOK_NO}. Seçimden sonra bu satırın maliyeti yeniden hesaplanır.`}
          rows={rowVariants}
          columns={variantColumns}
          loading={loading.rowVariants}
          selectedRow={
            rowVariants.find(
              (variant) =>
                String(variant.STOK_VARYANT_NO) ===
                String(editingRow.STOK_VARYANT_NO),
            ) ?? null
          }
          onClose={closeRowVariantDialog}
          onSelect={selectRowVariant}
        />
      ) : null}

      {extraDialog === 'stock' && extraDraft ? (
        <LookupDialog
          title="Ek Stok Kartı Seçimi"
          description={`${extraDraft.parent.STOK_ADI} altına eklenecek stok kartını seçiniz.`}
          rows={stocks}
          columns={stockColumns}
          loading={loading.stocks}
          selectedRow={extraDraft.stock}
          onClose={() => setExtraDialog('')}
          onSelect={selectExtraStock}
        />
      ) : null}

      {extraDialog === 'variant' && extraDraft ? (
        <LookupDialog
          title="Ek Stok Varyantı Seçimi"
          description={`Stok: ${extraDraft.stock.STOK_KODU ?? extraDraft.stock.STOK_NO}`}
          rows={extraVariants}
          columns={variantColumns}
          loading={loading.extraVariants}
          selectedRow={extraDraft.variant}
          onClose={() => setExtraDialog('')}
          onSelect={selectExtraVariant}
        />
      ) : null}
    </main>
  )
}

export default App

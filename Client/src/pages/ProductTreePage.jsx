import { useEffect, useEffectEvent, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import {
  FileDown,
  FileSpreadsheet,
  LoaderCircle,
  Search,
} from 'lucide-react'
import '../App.css'
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
import { getStokKartlar, getVaryantsByStokId } from '../api/stokApi'
import { createActivityLog } from '../api/activityLogApi'
import { LookupDialog } from '../components/LookupDialog'
import { BomStudioTable } from '../components/BomStudioTable'
import { BomTreeTable } from '../components/BomTreeTable'
import ProductTreePdf from '../components/ProductTreePdf'
import { SelectorField } from '../components/SelectorField'
import { costMethods } from '../config/productTree'
import { stockColumns, variantColumns } from '../config/tableColumns'
import { getStockLabel, getVariantLabel } from '../utils/formatters'
import {
  appendTreeChild,
  buildProductTree,
  collectExpandableIds,
  findTreeNode,
  getTreeTotalCost,
  removeExtraTreeNode,
  replaceTreeVariant,
} from '../utils/productTree'

function activityValue(row) {
  if (!row) return null
  return {
    stockCode: row.STOK_KODU ?? null,
    variantCode: row.VARYANT_KODU ?? null,
    quantity: Number(row.MIKTAR) || null,
    unit: row.BIRIM ?? null,
    unitPrice: Number(row.BIRIM_FIYAT) || 0,
    totalCost: Number(row.ANA_MALIYET) || 0,
    currency: row.DOVIZ_BIRIMI ?? null,
  }
}

const initialLoadingState = {
  stocks: false,
  variants: false,
  rowVariants: false,
  extraVariants: false,
  extraTree: false,
  excel: false,
  pdf: false,
  tree: false,
}

const ProductTreeTable = new URLSearchParams(window.location.search).has(
  'legacyTable',
)
  ? BomStudioTable
  : BomTreeTable

export function ProductTreePage() {
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
  const [visibleColumnIds, setVisibleColumnIds] = useState(null)

  function recordActivity(eventCode, row, oldValue, newValue) {
    const source = row ?? selectedStock
    return createActivityLog({
      eventCode,
      stockNo: Number(source?.STOK_NO ?? selectedStock?.STOK_NO),
      stockVariantNo: (source?.STOK_VARYANT_NO ?? selectedVariant?.STOK_VARYANT_NO)
        ? Number(source?.STOK_VARYANT_NO ?? selectedVariant?.STOK_VARYANT_NO)
        : null,
      stockCode: source?.STOK_KODU ?? selectedStock?.STOK_KODU ?? null,
      variantCode: source?.VARYANT_KODU ?? selectedVariant?.VARYANT_KODU ?? null,
      oldValue,
      newValue,
    })
  }

  const handleExportShortcut = useEffectEvent((key) => {
    if (!tree.length || loading.tree) return
    if (key === 'F3' && !loading.pdf) savePdf()
    if (key === 'F4' && !loading.excel) saveExcel()
  })

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.key !== 'F3' && event.key !== 'F4') || event.repeat) return
      event.preventDefault()
      handleExportShortcut(event.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

      const result = replaceTreeVariant(tree, targetRow.treeId, replacement)
      if (!result.replaced) throw new Error('Varyant satırı güncellenemedi.')
      await recordActivity(
        'VARYANT_DEGISTIR',
        targetRow,
        activityValue(targetRow),
        activityValue(replacement),
      )
      setTree(result.nodes)

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
      price: '',
    })
  }

  function editExtraRow(row, parent) {
    setMessage('')
    setExtraVariants([])
    setExtraDraft({
      parent,
      editingTreeId: row.treeId,
      stock: row,
      variant: row.STOK_VARYANT_NO ? row : null,
      quantity: String(row.MIKTAR ?? '1'),
      unit: row.BIRIM ?? 'Adet',
      price: String(row.BIRIM_FIYAT ?? ''),
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
      price: '',
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
      price: '',
    }))
    setExtraDialog('')
  }

  async function addExtraRow() {
    if (!extraDraft?.stock) {
      setMessage('Ek bileşen için stok kartı seçiniz.')
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
    let child

    if (extraDraft.variant) {
      setLoadingField('extraTree', true)
      try {
        const [variantTree] = await buildProductTree({
          stokVaryantNo: extraDraft.variant.STOK_VARYANT_NO,
          stokNo: extraDraft.stock.STOK_NO,
          birim: extraDraft.unit,
          miktar: parsedQuantity,
          maliyetYontemi: treeCostMethod || costMethod,
        })
        const total = variantTree ? getTreeTotalCost(variantTree) : Number.NaN

        if (!variantTree || !Number.isFinite(total)) {
          throw new Error('Seçilen varyant için geçerli maliyet ağacı bulunamadı.')
        }

        child = {
          ...variantTree,
          STOK_NO: extraDraft.stock.STOK_NO,
          STOK_KODU: extraDraft.stock.STOK_KODU,
          STOK_ADI: extraDraft.stock.STOK_ADI,
          STOK_TIP_ADI: extraDraft.stock.STOK_TIP_ADI,
          STOK_VARYANT_NO: extraDraft.variant.STOK_VARYANT_NO,
          VARYANT_KODU: extraDraft.variant.VARYANT_KODU,
          VARYANT_ADI: extraDraft.variant.VARYANT_ADI,
          MIKTAR: parsedQuantity,
          BIRIM: extraDraft.unit,
          BIRIM_FIYAT: total / parsedQuantity,
          TUTAR: total,
          ANA_MALIYET: total,
        }
      } catch (error) {
        setMessage(error.message)
        return
      } finally {
        setLoadingField('extraTree', false)
      }
    } else {
      const parsedPrice = Number(extraDraft.price)
      if (
        extraDraft.price === '' ||
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0
      ) {
        setMessage('Ek bileşen birim fiyatı sıfır veya daha büyük olmalıdır.')
        return
      }

      const total = parsedQuantity * parsedPrice
      child = {
        STOK_NO: extraDraft.stock.STOK_NO,
        STOK_KODU: extraDraft.stock.STOK_KODU,
        STOK_ADI: extraDraft.stock.STOK_ADI,
        STOK_TIP_ADI: extraDraft.stock.STOK_TIP_ADI,
        MIKTAR: parsedQuantity,
        BIRIM: extraDraft.unit,
        BIRIM_FIYAT: parsedPrice,
        TUTAR: total,
        ANA_MALIYET: total,
        DOVIZ_BIRIMI:
          tree[0]?.DOVIZ_BIRIMI ?? extraDraft.parent.DOVIZ_BIRIMI,
        children: [],
      }
    }

    const treeCurrency = String(tree[0]?.DOVIZ_BIRIMI ?? '').trim()
    const childCurrency = String(child.DOVIZ_BIRIMI ?? '').trim()
    if (treeCurrency && childCurrency && treeCurrency !== childCurrency) {
      setMessage('Farklı döviz birimindeki maliyetler birleştirilemez.')
      return
    }

    const previous = extraDraft.editingTreeId
      ? findTreeNode(tree, extraDraft.editingTreeId)
      : null
    const result = extraDraft.editingTreeId
      ? replaceTreeVariant(tree, extraDraft.editingTreeId, child)
      : appendTreeChild(tree, extraDraft.parent.treeId, child)

    if (!(result.appended || result.replaced)) {
      setMessage('Ek bileşen satırı güncellenemedi.')
      return
    }

    try {
      await recordActivity(
        extraDraft.editingTreeId ? 'BILESEN_DEGISTIR' : 'BILESEN_EKLE',
        child,
        activityValue(previous),
        activityValue(child),
      )
    } catch (error) {
      setMessage(error.message)
      return
    }

    setTree(result.nodes)
    cancelExtraRow()
  }

  async function removeExtraRow(treeId) {
    const removedRow = findTreeNode(tree, treeId)
    const result = removeExtraTreeNode(tree, treeId)
    if (!result.removed || !removedRow) return

    try {
      await recordActivity(
        'BILESEN_SIL',
        removedRow,
        activityValue(removedRow),
        null,
      )
      setTree(result.nodes)
    } catch (error) {
      setMessage(error.message)
    }
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

      if (nodes.length) {
        await recordActivity('MLYT_HESAPLA', nodes[0], null, {
          ...activityValue(nodes[0]),
          costMethod,
        })
      }
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

  async function savePdf() {
    setMessage('')
    setLoadingField('pdf', true)

    try {
      const reportCostMethod = treeCostMethod || costMethod
      const blob = await pdf(
        <ProductTreePdf
          stock={selectedStock}
          variant={selectedVariant}
          quantity={tree[0]?.MIKTAR ?? quantity}
          unit={tree[0]?.BIRIM ?? unit}
          costMethod={
            costMethods.find((method) => method.value === reportCostMethod)
              ?.label ?? reportCostMethod
          }
          tree={tree}
          visibleColumnIds={visibleColumnIds}
        />,
      ).toBlob()
      await recordActivity('PDF_AKTAR', tree[0], null, {
        ...activityValue(tree[0]),
        rowCount: tree.length,
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const stockCode = String(selectedStock?.STOK_KODU ?? 'urun-agaci').replace(
        /[<>:"/\\|?*]/g,
        '-',
      )

      link.href = url
      link.download = `urun-agaci-${stockCode}.pdf`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 0)
    } catch (error) {
      setMessage(`PDF oluşturulamadı: ${error.message}`)
    } finally {
      setLoadingField('pdf', false)
    }
  }

  async function saveExcel() {
    setMessage('')
    setLoadingField('excel', true)

    try {
      const { saveProductTreeExcel } = await import(
        '../utils/productTreeExcel'
      )
      const stockCode = String(selectedStock?.STOK_KODU ?? 'urun-agaci').replace(
        /[<>:"/\\|?*]/g,
        '-',
      )

      await recordActivity('EXCEL_AKTAR', tree[0], null, {
        ...activityValue(tree[0]),
        rowCount: tree.length,
      })
      saveProductTreeExcel(
        tree,
        visibleColumnIds,
        `urun-agaci-${stockCode}.xlsx`,
        {
          stock: `${selectedStock?.STOK_KODU ?? ''} - ${selectedStock?.STOK_ADI ?? ''}`,
          variant: `${selectedVariant?.VARYANT_KODU ?? ''} - ${selectedVariant?.VARYANT_ADI ?? ''}`,
          quantity: tree[0]?.MIKTAR ?? quantity,
          unit: tree[0]?.BIRIM ?? unit,
          costMethod:
            costMethods.find(
              (method) => method.value === (treeCostMethod || costMethod),
            )?.label ?? (treeCostMethod || costMethod),
        },
      )
    } catch (error) {
      setMessage(`Excel oluşturulamadı: ${error.message}`)
    } finally {
      setLoadingField('excel', false)
    }
  }



    

  function setLoadingField(key, value) {
    setLoading((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="erp-page">
      <div className="page-shell">
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
                onChange={(event) => setQuantity(event.target.value)}
                aria-invalid={quantity !== '' && Number(quantity) <= 0}
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

          <div className="tree-actions-card">
            <Button className="search-action" type="submit" disabled={loading.tree}>
              {loading.tree ? (
                <LoaderCircle className="loading-icon" data-icon="inline-start" />
              ) : (
                <Search data-icon="inline-start" />
              )}
              {loading.tree ? 'Bulunuyor...' : 'Ağacı Göster'}
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

          </div>

          <div
            className="export-actions-card"
            role="group"
            aria-label="Kayıt ve dışa aktarma işlemleri"
          >
            <div className="save-actions">

              <Button
                type="button"
                variant="outline"
                onClick={savePdf}
                disabled={!tree.length || loading.tree || loading.pdf}
                title="PDF Kaydet (F3)"
              >
                {loading.pdf ? (
                  <LoaderCircle className="loading-icon" data-icon="inline-start" />
                ) : (
                  <FileDown data-icon="inline-start" />
                )}
                {loading.pdf ? 'PDF oluşturuluyor...' : 'PDF Kaydet'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={saveExcel}
                disabled={!tree.length || loading.tree || loading.excel}
                title="Excel Kaydet (F4)"
              >
                {loading.excel ? (
                  <LoaderCircle className="loading-icon" data-icon="inline-start" />
                ) : (
                  <FileSpreadsheet data-icon="inline-start" />
                )}
                {loading.excel ? 'Excel oluşturuluyor...' : 'Excel Kaydet'}
              </Button>
            </div>
          </div>
        </form>

        {message ? (
          <div className="notice" role="status">
            <span aria-hidden="true">!</span>
            {message}
          </div>
        ) : null}

        <section className="result-panel" aria-label="Ürün ağacı sonuçları">
          <ProductTreeTable
            rows={tree}
            expandedIds={expandedIds}
            onExpandedIdsChange={setExpandedIds}
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
            onExtraPriceChange={(value) =>
              setExtraDraft((current) => ({ ...current, price: value }))
            }
            onExtraSubmit={addExtraRow}
            onExtraEdit={editExtraRow}
            onExtraRemove={removeExtraRow}
            onVisibleColumnIdsChange={setVisibleColumnIds}
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


    </div>
  )
}

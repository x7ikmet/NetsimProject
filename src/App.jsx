import { useState } from 'react'
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
  buildProductTree,
  collectExpandableIds,
} from './utils/productTree'

const initialLoadingState = {
  stocks: false,
  variants: false,
  tree: false,
}

function App() {
  const [stocks, setStocks] = useState([])
  const [variants, setVariants] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [tree, setTree] = useState([])
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [loading, setLoading] = useState(initialLoadingState)
  const [message, setMessage] = useState('')
  const [unit, setUnit] = useState('Adet')
  const [quantity, setQuantity] = useState('1')
  const [costMethod, setCostMethod] = useState(costMethods[0].value)

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

  function selectStock(stock) {
    setSelectedStock(stock)
    setSelectedVariant(null)
    setVariants([])
    setUnit(stock.BIRIM1 ?? 'Adet')
    clearTree()
    setStockDialogOpen(false)
  }

  function selectVariant(variant) {
    setSelectedVariant(variant)
    setUnit(variant.BIRIM ?? selectedStock?.BIRIM1 ?? 'Adet')
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
        birim: unit.trim(),
        miktar: parsedQuantity,
      })

      setTree(nodes)
      setExpandedIds(new Set())

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
    setExpandedIds((current) => {
      const next = new Set(current)
      next.has(treeId) ? next.delete(treeId) : next.add(treeId)
      return next
    })
  }

  function collapseTree() {
    setExpandedIds(new Set())
  }

  function expandTree() {
    setExpandedIds(new Set(collectExpandableIds(tree)))
  }

  function clearTree() {
    setTree([])
    setExpandedIds(new Set())
  }

  function setLoadingField(key, value) {
    setLoading((current) => ({ ...current, [key]: value }))
  }

  return (
    <main className="erp-page">
      <header className="page-header">
        <div>
          <h1>Ürün Ağacı</h1>
        </div>
      </header>

      <form className="search-panel" onSubmit={findProductTree}>
        <FieldGroup className="search-fields">
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
              onChange={(event) => {
                setUnit(event.target.value)
                clearTree()
              }}
              placeholder="Adet"
            />
          </Field>

          <Field className="search-quantity">
            <FieldLabel htmlFor="quantity">Miktar</FieldLabel>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="any"
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value)
                clearTree()
              }}
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

          <Button className="search-action" type="submit" disabled={loading.tree}>
            {loading.tree ? 'Bulunuyor...' : 'Bul'}
          </Button>
        </FieldGroup>
      </form>

      {message ? <div className="notice">{message}</div> : null}

      <section className="result-panel">
        <BomStudioTable
          rows={tree}
          expandedIds={expandedIds}
          onToggle={toggleRow}
          emptyText={
            loading.tree
              ? 'Ürün ağacı yükleniyor...'
              : 'Stok ve varyant seçip Bul butonuna basınız.'
          }
        />
      </section>

      {stockDialogOpen ? (
        <LookupDialog
          title="Stok Kart Seçimi"
          description="ERP sisteminden gelen stok kartları içinden seçim yapın."
          open={stockDialogOpen}
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
          description="Seçili stok kartına bağlı varyantlar."
          open={variantDialogOpen}
          rows={variants}
          columns={variantColumns}
          loading={loading.variants}
          selectedRow={selectedVariant}
          onClose={() => setVariantDialogOpen(false)}
          onSelect={selectVariant}
        />
      ) : null}
    </main>
  )
}

export default App

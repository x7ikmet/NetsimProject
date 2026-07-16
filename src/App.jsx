import { useMemo, useState } from 'react'
import './App.css'
import { getStokKartlar, getVaryantsByStokId } from './api/stokApi'
import { LookupDialog } from './components/LookupDialog'
import { ProductTreeTable } from './components/ProductTreeTable'
import { SelectorField } from './components/SelectorField'
import { stockColumns, variantColumns } from './config/tableColumns'
import { getStockLabel, getVariantLabel } from './utils/formatters'
import {
  buildProductTree,
  collectExpandedIds,
  createRootTreeNode,
  flattenTree,
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

  const visibleTreeRows = useMemo(
    () => flattenTree(tree, expandedIds),
    [tree, expandedIds],
  )

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
    clearTree()
    setStockDialogOpen(false)
  }

  function selectVariant(variant) {
    setSelectedVariant(variant)
    clearTree()
    setVariantDialogOpen(false)
  }

  async function findProductTree() {
    setMessage('')

    if (!selectedVariant) {
      setMessage('Ürün ağacı için stok varyantı seçiniz.')
      return
    }

    setLoadingField('tree', true)
    try {
      const children = await buildProductTree(selectedVariant.STOK_VARYANT_NO)
      const nodes = [createRootTreeNode(selectedStock, selectedVariant, children)]

      setTree(nodes)
      setExpandedIds(new Set(collectExpandedIds(nodes)))

      if (!children.length) {
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

      <section className="search-panel">
        <SelectorField
          label="Stok Adı"
          value={getStockLabel(selectedStock)}
          placeholder="Stok adı giriniz"
          onOpen={openStockDialog}
        />

        <SelectorField
          label="Stok Varyantı"
          value={getVariantLabel(selectedVariant)}
          placeholder="Stok varyantı giriniz"
          onOpen={openVariantDialog}
          disabled={!selectedStock}
        />

        <button
          className="find-button"
          type="button"
          onClick={findProductTree}
          disabled={loading.tree}
        >
          {loading.tree ? 'Bulunuyor...' : 'Bul'}
        </button>
      </section>

      {message ? <div className="notice">{message}</div> : null}

      <section className="result-panel">
        <div className="tab-bar">
          <button type="button" className="active">
            Ürün Ağacı
          </button>
        </div>

        <ProductTreeTable
          rows={visibleTreeRows}
          expandedIds={expandedIds}
          onToggle={toggleRow}
          emptyText={
            loading.tree
              ? 'Ürün ağacı yükleniyor...'
              : 'Stok ve varyant seçip Bul butonuna basınız.'
          }
        />
      </section>

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
    </main>
  )
}

export default App

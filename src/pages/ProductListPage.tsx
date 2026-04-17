import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, RotateCcw, Package } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import Pagination from '../components/ui/Pagination'
import Breadcrumb from '../components/ui/Breadcrumb'
import { productsApi, CATEGORY_TO_API, type ProductSummary, type ProductPage } from '../api/products'

const SORT_OPTIONS = ['추천순', '최신순', '낮은가격', '높은가격']

const SORT_TO_API: Record<string, { sortType?: string; priceSortType?: string }> = {
  '추천순':    { sortType: 'POPULAR' },
  '최신순':    { sortType: 'RECENT' },
  '낮은가격':  { priceSortType: 'ASC' },
  '높은가격':  { priceSortType: 'DESC' },
}

const CATEGORY_LABEL: Record<string, string> = {
  beauty: '뷰티',
  fashion: '패션',
  food: '식품',
  tool: '가전',
}

const SEARCH_CATEGORIES = [
  { label: '전체', value: '' },
  { label: '뷰티', value: 'beauty' },
  { label: '패션', value: 'fashion' },
  { label: '식품', value: 'food' },
  { label: '가전', value: 'tool' },
]

const PAGE_SIZE = 12

function toProduct(p: ProductSummary) {
  return { ...p, brand: p.seller?.storeName }
}

// ── 간단 필터 패널 ─────────────────────────────────────────────
function FilterPanel({ priceMax, priceValue, onPriceChange, onReset }: {
  priceMax: number
  priceValue: number
  onPriceChange: (v: number) => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>필터</span>
        <button onClick={onReset} className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
          style={{ color: 'var(--color-primary)' }}>
          <RotateCcw size={11} />초기화
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2.5" style={{ color: 'var(--color-text-secondary)' }}>가격 범위</p>
        <input type="range" min={0} max={priceMax} step={1000}
          value={priceValue}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)]" />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          <span>0원</span>
          <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
            {priceValue.toLocaleString()}원 이하
          </span>
        </div>
      </div>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryKey  = searchParams.get('category') ?? ''
  const searchQuery  = searchParams.get('q') ?? ''
  const isSearchMode = !!searchQuery

  const [page, setPage]         = useState(1)
  const [sort, setSort]         = useState('추천순')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchCatFilter, setSearchCatFilter] = useState('')
  const [priceMax]              = useState(500000)
  const [priceFilter, setPriceFilter] = useState(500000)

  const [products, setProducts]     = useState<ProductSummary[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading]       = useState(false)

  // 검색 결과
  const [searchResults, setSearchResults] = useState<ProductSummary[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // 카테고리 목록 fetch
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const apiParams = SORT_TO_API[sort] ?? {}
      const res = await productsApi.getAll({
        page: page - 1,
        size: PAGE_SIZE,
        ...(categoryKey ? { productCategoryType: CATEGORY_TO_API[categoryKey] } : {}),
        ...apiParams,
      })
      const data: ProductPage = res.data
      setProducts(data.content)
      setTotalPages(data.totalPages || 1)
      setTotalElements(data.totalElements)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [categoryKey, sort, page])

  useEffect(() => {
    if (!isSearchMode) fetchProducts()
  }, [isSearchMode, fetchProducts])

  // 검색
  useEffect(() => {
    if (!isSearchMode) return
    const doSearch = async () => {
      setSearchLoading(true)
      try {
        const res = await productsApi.search(searchQuery)
        setSearchResults(res.data)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }
    doSearch()
  }, [isSearchMode, searchQuery])

  // 카테고리/정렬 변경 시 페이지 초기화
  useEffect(() => { setPage(1) }, [categoryKey, sort])
  useEffect(() => { setPage(1); setSearchCatFilter('') }, [searchQuery])

  const handleReset = () => { setPriceFilter(priceMax); setPage(1) }

  // 가격 필터는 클라이언트사이드 (API에 세밀한 가격 범위 파라미터 없음)
  const filteredProducts = products.filter((p) => p.price <= priceFilter)

  const filteredSearch = searchResults.filter((p) => {
    const matchCat = !searchCatFilter || (CATEGORY_TO_API[searchCatFilter] ?? searchCatFilter) === p.seller?.storeName
    return matchCat && p.price <= priceFilter
  })

  // ── 검색 모드 UI ─────────────────────────────────────────────
  if (isSearchMode) {
    return (
      <div className="max-w-[1200px] mx-auto px-8 py-6">
        <Breadcrumb items={[{ label: '홈', to: '/' }, { label: `검색: ${searchQuery}` }]} />

        <div className="mt-5 mb-6">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            <span style={{ color: 'var(--color-primary)' }}>"{searchQuery}"</span> 검색 결과
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            총 {searchResults.length}개의 상품
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {SEARCH_CATEGORIES.map((cat) => (
            <button key={cat.value}
              onClick={() => { setSearchCatFilter(cat.value); setPage(1) }}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
              style={cat.value === searchCatFilter
                ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
            >{cat.label}</button>
          ))}
        </div>

        {searchLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : filteredSearch.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSearch.map((p) => <ProductCard key={p.id} product={toProduct(p)} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Package size={40} style={{ color: 'var(--color-text-disabled)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--color-text-disabled)' }}>
              "{searchQuery}"에 대한 검색 결과가 없어요
            </p>
            <button onClick={() => setSearchParams({})} className="text-sm" style={{ color: 'var(--color-primary)' }}>
              전체 상품 보기
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── 카테고리 모드 UI ─────────────────────────────────────────
  const categoryLabel = CATEGORY_LABEL[categoryKey] ?? '전체 상품'

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-6">
      <Breadcrumb items={[{ label: '홈', to: '/' }, { label: categoryLabel }]} />

      <div className="flex gap-8 mt-6">
        {/* Sidebar — desktop */}
        <aside className="shrink-0 w-[200px] sticky top-[68px] self-start hidden md:block max-h-[calc(100vh-100px)] overflow-y-auto">
          <FilterPanel priceMax={priceMax} priceValue={priceFilter}
            onPriceChange={(v) => { setPriceFilter(v); setPage(1) }}
            onReset={handleReset} />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-72 bg-white h-full overflow-y-auto p-5 ml-auto">
              <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
              <FilterPanel priceMax={priceMax} priceValue={priceFilter}
                onPriceChange={(v) => { setPriceFilter(v); setPage(1) }}
                onReset={handleReset} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{categoryLabel}</span>{' '}
              {totalElements}개의 상품
            </p>
            <div className="flex items-center gap-2">
              <button
                className="md:hidden flex items-center gap-1.5 text-sm border rounded-lg px-3 py-1.5"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                onClick={() => setSidebarOpen(true)}
              >
                <SlidersHorizontal size={14} /> 필터
              </button>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}
                className="text-sm border rounded-lg px-3 py-1.5 outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p) => <ProductCard key={p.id} product={toProduct(p)} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Package size={40} style={{ color: 'var(--color-text-disabled)' }} />
              <p className="text-lg font-medium" style={{ color: 'var(--color-text-disabled)' }}>
                상품이 없습니다
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination current={page} total={totalPages} onChange={setPage} />
          )}
        </div>
      </div>
    </div>
  )
}

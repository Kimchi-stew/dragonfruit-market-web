import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import Pagination from '../components/ui/Pagination'
import Breadcrumb from '../components/ui/Breadcrumb'
import { MOCK_PRODUCTS } from '../data/mockProducts'

const SORT_OPTIONS = ['추천순', '낮은가격', '높은가격', '리뷰많은순']
const PAGE_SIZE = 8

// ── 카테고리별 메타 ──────────────────────────────────────────
const CATEGORY_META: Record<string, {
  label: string
  subcategories: string[]
  filters: FilterSection[]
}> = {
  beauty: {
    label: '뷰티',
    subcategories: ['전체', '스킨케어', '메이크업', '헤어케어', '바디케어', '향수'],
    filters: [
      { id: 'type',     title: '제품 유형', type: 'checkbox', options: ['스킨케어', '메이크업', '헤어케어', '바디케어', '향수'] },
      { id: 'skin',     title: '피부 타입', type: 'chip',     options: ['전체', '건성', '지성', '복합성', '민감성'] },
      { id: 'function', title: '기능',      type: 'checkbox', options: ['보습', '미백', '주름개선', '자외선차단', '진정'] },
      { id: 'price',    title: '가격 범위', type: 'range',    max: 100000 },
      { id: 'rating',   title: '평점',      type: 'rating' },
    ],
  },
  fashion: {
    label: '패션',
    subcategories: ['전체', '정장/슈트', '가죽/에코가죽', '기능성/아웃도어', '친환경소재'],
    filters: [
      { id: 'gender',   title: '성별',      type: 'chip',     options: ['전체', '남성', '여성'] },
      { id: 'category', title: '카테고리',  type: 'checkbox', options: ['상의', '하의', '아우터', '원피스', '가방', '기타'] },
      { id: 'size',     title: '사이즈',    type: 'chip',     options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'color',    title: '색상',      type: 'color',    options: ['#1A1A1A', '#FFFFFF', '#9E9E9E', '#1565C0', '#F5F0E8', '#FF8A80'] },
      { id: 'price',    title: '가격 범위', type: 'range',    max: 200000 },
      { id: 'rating',   title: '평점',      type: 'rating' },
    ],
  },
  food: {
    label: '식품',
    subcategories: ['전체', '간식', '음료', '건강식품', '신선식품', '가공식품'],
    filters: [
      { id: 'category', title: '카테고리',  type: 'checkbox', options: ['간식', '음료', '건강식품', '신선식품', '가공식품'] },
      { id: 'cert',     title: '인증',      type: 'checkbox', options: ['유기농', '무농약', '비건', '무설탕', 'HACCP'] },
      { id: 'weight',   title: '중량',      type: 'chip',     options: ['100g 이하', '100~500g', '500g~1kg', '1kg 이상'] },
      { id: 'price',    title: '가격 범위', type: 'range',    max: 50000 },
      { id: 'rating',   title: '평점',      type: 'rating' },
    ],
  },
  tool: {
    label: '가전',
    subcategories: ['전체', '주방용품', '생활용품', '청소용품', '수납', '인테리어'],
    filters: [
      { id: 'category', title: '카테고리',  type: 'checkbox', options: ['주방용품', '생활용품', '청소용품', '수납', '인테리어'] },
      { id: 'material', title: '소재',      type: 'checkbox', options: ['스테인레스', '플라스틱', '실리콘', '나무', '유리', '기타'] },
      { id: 'price',    title: '가격 범위', type: 'range',    max: 200000 },
      { id: 'rating',   title: '평점',      type: 'rating' },
    ],
  },
  sports: {
    label: '스포츠',
    subcategories: ['전체', '헬스', '러닝', '요가/필라테스', '수영', '구기', '등산'],
    filters: [
      { id: 'gender',   title: '성별',      type: 'chip',     options: ['전체', '남성', '여성'] },
      { id: 'sport',    title: '종목',      type: 'checkbox', options: ['헬스', '러닝', '요가/필라테스', '수영', '구기', '등산'] },
      { id: 'size',     title: '사이즈',    type: 'chip',     options: ['XS', 'S', 'M', 'L', 'XL'] },
      { id: 'price',    title: '가격 범위', type: 'range',    max: 150000 },
      { id: 'rating',   title: '평점',      type: 'rating' },
    ],
  },
  pet: {
    label: '반려동물',
    subcategories: ['전체', '강아지', '고양이', '소동물', '물고기'],
    filters: [
      { id: 'animal',   title: '동물 종류', type: 'chip',     options: ['전체', '강아지', '고양이', '소동물'] },
      { id: 'age',      title: '연령',      type: 'chip',     options: ['전체', '퍼피/키튼', '성견/성묘', '시니어'] },
      { id: 'product',  title: '제품 유형', type: 'checkbox', options: ['사료', '간식', '용품', '위생', '장난감'] },
      { id: 'price',    title: '가격 범위', type: 'range',    max: 100000 },
      { id: 'rating',   title: '평점',      type: 'rating' },
    ],
  },
}

const DEFAULT_META = CATEGORY_META.fashion

// ── 필터 타입 ─────────────────────────────────────────────────
type FilterSection =
  | { id: string; title: string; type: 'checkbox'; options: string[] }
  | { id: string; title: string; type: 'chip';     options: string[] }
  | { id: string; title: string; type: 'color';    options: string[] }
  | { id: string; title: string; type: 'range';    max: number }
  | { id: string; title: string; type: 'rating' }

// ── 필터 매칭 함수 ────────────────────────────────────────────
function matchesFilters(
  product: (typeof MOCK_PRODUCTS)[0],
  chipValues: Record<string, string>,
  checkValues: Record<string, string[]>,
  rangeValues: Record<string, number>,
  subCat: string,
  categoryKey: string,
): boolean {
  const meta = CATEGORY_META[categoryKey] ?? DEFAULT_META

  // 서브카테고리
  if (subCat !== '전체' && product.subcategory !== subCat) return false

  // 가격 범위
  const priceSection = meta.filters.find((f) => f.type === 'range') as { id: string; max: number } | undefined
  if (priceSection) {
    const maxPrice = rangeValues[priceSection.id] ?? priceSection.max
    if (product.price > maxPrice) return false
  }

  // 평점
  const ratingChecked = checkValues['rating'] ?? []
  if (ratingChecked.length > 0) {
    const minRating = Math.min(...ratingChecked.map((r) => parseInt(r)))
    if (product.rating < minRating) return false
  }

  // chip 필터 (단일 선택, '전체' = 무시)
  for (const [id, val] of Object.entries(chipValues)) {
    if (!val || val === '전체') continue
    const pVal = product.attrs[id]
    if (!pVal) return false
    if (Array.isArray(pVal) ? !pVal.includes(val) : pVal !== val) return false
  }

  // checkbox 필터 (다중 선택, OR 로직)
  for (const [id, selected] of Object.entries(checkValues)) {
    if (id === 'rating') continue          // 평점은 별도 처리
    if (!selected || selected.length === 0) continue
    const pVal = product.attrs[id]
    if (!pVal) return false
    const pArr = Array.isArray(pVal) ? pVal : [pVal]
    if (!selected.some((s) => pArr.includes(s))) return false
  }

  // color checkbox
  const colorSelected = checkValues['color'] ?? []
  if (colorSelected.length > 0) {
    const pColor = product.attrs['color']
    if (!pColor) return false
    const pArr = Array.isArray(pColor) ? pColor : [pColor]
    if (!colorSelected.some((c) => pArr.includes(c))) return false
  }

  return true
}

// ── 정렬 함수 ─────────────────────────────────────────────────
function sortProducts(products: typeof MOCK_PRODUCTS, sort: string) {
  return [...products].sort((a, b) => {
    if (sort === '낮은가격') return a.price - b.price
    if (sort === '높은가격') return b.price - a.price
    if (sort === '리뷰많은순') return b.reviewCount - a.reviewCount
    return b.rating - a.rating  // 추천순
  })
}

// ── 필터 섹션 렌더러 ──────────────────────────────────────────
function FilterSectionUI({
  section, chipValues, setChipValue, checkValues, toggleCheck, rangeValues, setRangeValue,
}: {
  section: FilterSection
  chipValues: Record<string, string>
  setChipValue: (id: string, v: string) => void
  checkValues: Record<string, string[]>
  toggleCheck: (id: string, v: string) => void
  rangeValues: Record<string, number>
  setRangeValue: (id: string, v: number) => void
}) {
  return (
    <div>
      <p className="text-xs font-semibold mb-2.5" style={{ color: 'var(--color-text-secondary)' }}>
        {section.title}
      </p>

      {section.type === 'chip' && (
        <div className="flex flex-wrap gap-1.5">
          {section.options.map((opt) => {
            const active = chipValues[section.id] === opt
            return (
              <button key={opt}
                onClick={() => setChipValue(section.id, active && opt !== '전체' ? '' : opt)}
                className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                style={active
                  ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                  : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
              >{opt}</button>
            )
          })}
        </div>
      )}

      {section.type === 'checkbox' && (
        <div className="flex flex-col gap-2">
          {section.options.map((opt) => {
            const checked = (checkValues[section.id] ?? []).includes(opt)
            return (
              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={checked}
                  onChange={() => toggleCheck(section.id, opt)}
                  className="w-4 h-4 rounded accent-[var(--color-primary)] cursor-pointer" />
                <span style={{ color: checked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                  {opt}
                </span>
              </label>
            )
          })}
        </div>
      )}

      {section.type === 'color' && (
        <div className="flex gap-2 flex-wrap">
          {section.options.map((hex) => {
            const active = (checkValues[section.id] ?? []).includes(hex)
            return (
              <button key={hex} onClick={() => toggleCheck(section.id, hex)}
                className="w-7 h-7 rounded-full border-2 transition-all"
                style={{
                  background: hex,
                  borderColor: active ? 'var(--color-primary)' : hex === '#FFFFFF' ? 'var(--color-border)' : hex,
                  outline: active ? '2px solid var(--color-primary)' : 'none',
                  outlineOffset: 2,
                  boxShadow: hex === '#FFFFFF' ? '0 0 0 1px #E0E0E0 inset' : undefined,
                }}
              />
            )
          })}
        </div>
      )}

      {section.type === 'range' && (
        <div>
          <input type="range" min={0} max={section.max} step={1000}
            value={rangeValues[section.id] ?? section.max}
            onChange={(e) => setRangeValue(section.id, Number(e.target.value))}
            className="w-full accent-[var(--color-primary)]" />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            <span>0원</span>
            <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
              {(rangeValues[section.id] ?? section.max).toLocaleString()}원 이하
            </span>
          </div>
        </div>
      )}

      {section.type === 'rating' && (
        <div className="flex flex-col gap-2">
          {[4, 3, 2].map((star) => {
            const key = `${star}+`
            const checked = (checkValues['rating'] ?? []).includes(key)
            return (
              <label key={star} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={checked}
                  onChange={() => toggleCheck('rating', key)}
                  className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer" />
                <span style={{ color: 'var(--color-star)' }}>{'★'.repeat(star)}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{star}점 이상</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── 필터 패널 ─────────────────────────────────────────────────
function FilterPanel({ filters, chipValues, setChipValue, checkValues, toggleCheck,
  rangeValues, setRangeValue, onReset, activeCount }: {
  filters: FilterSection[]
  chipValues: Record<string, string>
  setChipValue: (id: string, v: string) => void
  checkValues: Record<string, string[]>
  toggleCheck: (id: string, v: string) => void
  rangeValues: Record<string, number>
  setRangeValue: (id: string, v: number) => void
  onReset: () => void
  activeCount: number
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>필터</span>
          {activeCount > 0 && (
            <span className="text-xs font-bold text-white px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--color-primary)' }}>{activeCount}</span>
          )}
        </div>
        <button onClick={onReset}
          className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
          style={{ color: 'var(--color-primary)' }}>
          <RotateCcw size={11} />초기화
        </button>
      </div>

      {filters.map((section, i) => (
        <div key={section.id}>
          <FilterSectionUI section={section} chipValues={chipValues} setChipValue={setChipValue}
            checkValues={checkValues} toggleCheck={toggleCheck}
            rangeValues={rangeValues} setRangeValue={setRangeValue} />
          {i < filters.length - 1 && (
            <div className="mt-5 h-px" style={{ background: 'var(--color-border)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

const SEARCH_CATEGORIES = [
  { label: '전체', value: '' },
  { label: '뷰티', value: 'beauty' },
  { label: '패션', value: 'fashion' },
  { label: '식품', value: 'food' },
  { label: '가전', value: 'tool' },
  { label: '스포츠', value: 'sports' },
  { label: '반려동물', value: 'pet' },
]

// ── 메인 페이지 ───────────────────────────────────────────────
export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryKey  = searchParams.get('category') ?? ''
  const searchQuery  = searchParams.get('q') ?? ''
  const isSearchMode = !!searchQuery

  const meta = CATEGORY_META[categoryKey] ?? DEFAULT_META

  const [page, setPage]           = useState(1)
  const [subCat, setSubCat]       = useState('전체')
  const [sort, setSort]           = useState('추천순')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchCatFilter, setSearchCatFilter] = useState('')

  const [chipValues, setChipValuesState]   = useState<Record<string, string>>({})
  const [checkValues, setCheckValues]      = useState<Record<string, string[]>>({})
  const [rangeValues, setRangeValuesState] = useState<Record<string, number>>({})

  // 카테고리 변경 시 필터·페이지 초기화
  useEffect(() => {
    setPage(1); setSubCat('전체')
    setChipValuesState({}); setCheckValues({}); setRangeValuesState({})
    setSort('추천순')
  }, [categoryKey])

  // 검색어 변경 시 초기화
  useEffect(() => {
    setPage(1); setSearchCatFilter(''); setSort('추천순')
  }, [searchQuery])

  // 서브카테고리 변경 시 페이지 초기화
  useEffect(() => { setPage(1) }, [subCat])

  const setChipValue  = (id: string, v: string) => { setPage(1); setChipValuesState((p) => ({ ...p, [id]: v })) }
  const setRangeValue = (id: string, v: number) => { setPage(1); setRangeValuesState((p) => ({ ...p, [id]: v })) }
  const toggleCheck   = (id: string, v: string) => {
    setPage(1)
    setCheckValues((p) => {
      const arr = p[id] ?? []
      return { ...p, [id]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] }
    })
  }
  const handleReset = () => {
    setPage(1); setSubCat('전체')
    setChipValuesState({}); setCheckValues({}); setRangeValuesState({})
  }

  // 활성 필터 수
  const activeCount = useMemo(() => {
    let n = 0
    Object.values(chipValues).forEach((v) => { if (v && v !== '전체') n++ })
    Object.values(checkValues).forEach((arr) => { if (arr?.length) n++ })
    const priceSection = meta.filters.find((f) => f.type === 'range') as { max: number } | undefined
    if (priceSection && rangeValues['price'] !== undefined && rangeValues['price'] < priceSection.max) n++
    return n
  }, [chipValues, checkValues, rangeValues, meta])

  // ── 검색 모드 필터링 ─────────────────────────────────────────
  const searchFiltered = useMemo(() => {
    if (!isSearchMode) return []
    const q = searchQuery.toLowerCase()
    return MOCK_PRODUCTS.filter((p) => {
      const matchText = p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      const matchCat  = !searchCatFilter || p.category === searchCatFilter
      return matchText && matchCat
    })
  }, [isSearchMode, searchQuery, searchCatFilter])

  // ── 카테고리 모드 필터링 ─────────────────────────────────────
  const categoryProducts = useMemo(
    () => MOCK_PRODUCTS.filter((p) => p.category === (categoryKey || 'fashion')),
    [categoryKey],
  )
  const filtered = useMemo(
    () => categoryProducts.filter((p) =>
      matchesFilters(p, chipValues, checkValues, rangeValues, subCat, categoryKey || 'fashion')
    ),
    [categoryProducts, chipValues, checkValues, rangeValues, subCat, categoryKey],
  )

  const activeList = isSearchMode ? searchFiltered : filtered
  const sorted = useMemo(() => sortProducts(activeList, sort), [activeList, sort])

  // 페이지네이션
  const totalPages   = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage  = Math.min(page, totalPages)
  const pageProducts = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const filterPanelProps = {
    filters: meta.filters, chipValues, setChipValue, checkValues, toggleCheck,
    rangeValues, setRangeValue, onReset: handleReset, activeCount,
  }

  // ── 검색 모드 UI ─────────────────────────────────────────────
  if (isSearchMode) {
    return (
      <div className="max-w-[1200px] mx-auto px-8 py-6">
        <Breadcrumb items={[{ label: '홈', to: '/' }, { label: `검색: ${searchQuery}` }]} />

        {/* 검색 헤더 */}
        <div className="mt-5 mb-6">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            <span style={{ color: 'var(--color-primary)' }}>"{searchQuery}"</span> 검색 결과
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            총 {searchFiltered.length}개의 상품
          </p>
        </div>

        {/* 카테고리 필터 탭 */}
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

        {/* 정렬 */}
        <div className="flex justify-end mb-5">
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}
            className="text-sm border rounded-lg px-3 py-1.5 outline-none"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
            {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* 상품 그리드 */}
        {pageProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pageProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-lg font-medium" style={{ color: 'var(--color-text-disabled)' }}>
              "{searchQuery}"에 대한 검색 결과가 없어요
            </p>
            <button
              onClick={() => setSearchParams({})}
              className="text-sm"
              style={{ color: 'var(--color-primary)' }}
            >
              전체 상품 보기
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination current={currentPage} total={totalPages} onChange={setPage} />
        )}
      </div>
    )
  }

  // ── 카테고리 모드 UI ─────────────────────────────────────────
  return (
    <div className="max-w-[1200px] mx-auto px-8 py-6">
      <Breadcrumb items={[{ label: '홈', to: '/' }, { label: meta.label }]} />

      <div className="flex gap-8 mt-6">
        {/* Sidebar — desktop */}
        <aside className="shrink-0 w-[200px] sticky top-[68px] self-start hidden md:block max-h-[calc(100vh-100px)] overflow-y-auto">
          <FilterPanel {...filterPanelProps} />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-72 bg-white h-full overflow-y-auto p-5 ml-auto">
              <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
              <FilterPanel {...filterPanelProps} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Subcategory chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
            {meta.subcategories.map((s) => (
              <button key={s} onClick={() => setSubCat(s)}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={s === subCat
                  ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                  : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
              >{s}</button>
            ))}
          </div>

          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{meta.label}</span>{' '}
              {filtered.length}개의 상품
            </p>
            <div className="flex items-center gap-2">
              <button
                className="md:hidden flex items-center gap-1.5 text-sm border rounded-lg px-3 py-1.5 relative"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                onClick={() => setSidebarOpen(true)}
              >
                <SlidersHorizontal size={14} /> 필터
                {activeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center"
                    style={{ fontSize: 9, background: 'var(--color-primary)' }}>{activeCount}</span>
                )}
              </button>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}
                className="text-sm border rounded-lg px-3 py-1.5 outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Product grid */}
          {pageProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pageProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-lg font-medium" style={{ color: 'var(--color-text-disabled)' }}>
                검색 결과가 없어요
              </p>
              <button onClick={handleReset} className="text-sm" style={{ color: 'var(--color-primary)' }}>
                필터 초기화
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination current={currentPage} total={totalPages} onChange={setPage} />
          )}
        </div>
      </div>
    </div>
  )
}

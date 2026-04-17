import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Users, Heart, ChevronDown } from 'lucide-react'
import { sellersApi, type SellerSummary } from '../api/sellers'

const SORT_OPTIONS = [
  { label: '기본순', value: '' },
  { label: '팔로우 많은순', value: 'followCount' },
  { label: '좋아요 많은순', value: 'likeCount' },
]

export default function SellerListPage() {
  const [sellers, setSellers] = useState<SellerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('')
  const [sortOpen, setSortOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await sellersApi.getAll(sort || undefined)
        setSellers(res.data)
      } catch {
        setSellers([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [sort])

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '기본순'

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      {/* 헤더 */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            상점
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            다양한 판매자의 상점을 둘러보세요
          </p>
        </div>

        {/* 정렬 */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            {currentSortLabel}
            <ChevronDown size={14} />
          </button>
          {sortOpen && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] w-40 rounded-xl border overflow-hidden z-10"
              style={{ borderColor: 'var(--color-border)', background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setSortOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F7F7F7]"
                  style={{ color: sort === opt.value ? 'var(--color-primary)' : 'var(--color-text-primary)', fontWeight: sort === opt.value ? 600 : 400 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Store size={40} style={{ color: 'var(--color-text-disabled)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>등록된 상점이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {sellers.map((seller) => (
            <SellerCard key={seller.id} seller={seller} onClick={() => navigate(`/sellers/${seller.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SellerCard({ seller, onClick }: { seller: SellerSummary; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-5 rounded-2xl border text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
      style={{ borderColor: 'var(--color-border)', background: '#fff' }}
    >
      {/* 상점 이미지 */}
      <div
        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-bg-secondary)' }}
      >
        {seller.image ? (
          <img src={seller.image} alt={seller.storeName} className="w-full h-full object-cover" />
        ) : (
          <Store size={24} style={{ color: 'var(--color-text-disabled)' }} />
        )}
      </div>

      <div className="w-full">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {seller.storeName}
        </p>
        <div className="flex items-center justify-center gap-3 mt-1.5">
          <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <Users size={11} /> {seller.followCount}
          </span>
          <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <Heart size={11} /> {seller.likeCount}
          </span>
        </div>
      </div>
    </button>
  )
}

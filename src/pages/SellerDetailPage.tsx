import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Store, Users, Heart, ArrowLeft, Package } from 'lucide-react'
import { sellersApi, type Seller } from '../api/sellers'
import { ApiError } from '../api/client'

export default function SellerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [followLoading, setFollowLoading] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      try {
        const res = await sellersApi.getOne(Number(id))
        setSeller(res.data)
      } catch {
        setError('상점 정보를 불러올 수 없습니다')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Store size={40} style={{ color: 'var(--color-text-disabled)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>{error || '상점을 찾을 수 없습니다'}</p>
        <button
          onClick={() => navigate('/sellers')}
          className="text-sm font-medium mt-1"
          style={{ color: 'var(--color-primary)' }}
        >
          상점 목록으로
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors hover:opacity-70"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft size={16} /> 뒤로
      </button>

      {/* 상점 헤더 */}
      <div
        className="rounded-2xl border p-6 flex items-start gap-5 mb-8"
        style={{ borderColor: 'var(--color-border)', background: '#fff' }}
      >
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-bg-secondary)' }}
        >
          {seller.image ? (
            <img src={seller.image} alt={seller.storeName} className="w-full h-full object-cover" />
          ) : (
            <Store size={30} style={{ color: 'var(--color-text-disabled)' }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {seller.storeName}
          </h1>
          {seller.description && (
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {seller.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <Users size={14} />
              <strong style={{ color: 'var(--color-text-primary)' }}>{seller.followCount}</strong> 팔로워
            </span>
            <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <Heart size={14} />
              <strong style={{ color: 'var(--color-text-primary)' }}>{seller.likeCount}</strong> 좋아요
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (likeLoading) return
              setLikeLoading(true)
              try {
                const res = await sellersApi.like(seller.id)
                setSeller((s) => s ? { ...s, likeCount: res.data.likeCount } : s)
              } catch (err) {
                if (err instanceof ApiError && err.status === 401) {
                  alert('로그인이 필요합니다')
                }
              } finally { setLikeLoading(false) }
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Heart size={14} /> {seller.likeCount}
          </button>
          <button
            onClick={async () => {
              if (followLoading) return
              setFollowLoading(true)
              try {
                const res = await sellersApi.follow(seller.id)
                setSeller((s) => s ? {
                  ...s,
                  followed: res.data.followed,
                  followCount: s.followCount + (res.data.followed ? 1 : -1),
                } : s)
              } catch (err) {
                if (err instanceof ApiError && err.status === 401) {
                  alert('로그인이 필요합니다')
                }
              } finally { setFollowLoading(false) }
            }}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80 disabled:opacity-50"
            disabled={followLoading}
            style={
              seller.followed
                ? { background: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                : { background: 'var(--color-primary)', color: '#fff' }
            }
          >
            {seller.followed ? '팔로잉' : '팔로우'}
          </button>
        </div>
      </div>

      {/* 상품 영역 (추후 연동) */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          판매 상품
        </h2>
        <div
          className="flex flex-col items-center justify-center py-16 rounded-2xl border gap-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Package size={36} style={{ color: 'var(--color-text-disabled)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>등록된 상품이 없습니다</p>
        </div>
      </div>
    </div>
  )
}

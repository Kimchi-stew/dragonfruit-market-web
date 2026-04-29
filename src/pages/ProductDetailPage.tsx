import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Heart, Truck, Store, Star, ThumbsUp } from 'lucide-react'
import Button from '../components/ui/Button'
import StarRating from '../components/ui/StarRating'
import Breadcrumb from '../components/ui/Breadcrumb'
import { productsApi, type ProductDetail } from '../api/products'
import { reviewsApi, type ReviewSummary } from '../api/reviews'
import { cartApi } from '../api/cart'
import { ApiError } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { notifyCartChange } from '../utils/cartEvent'

const REVIEW_SORT_OPTIONS = [
  { label: '최신순',      sortType: 'RECENT' },
  { label: '오래된순',    sortType: 'OLDEST' },
  { label: '인기순',      sortType: 'POPULAR' },
  { label: '별점 높은순', ratingSortType: 'DESC' },
  { label: '별점 낮은순', ratingSortType: 'ASC' },
]

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={22}
            fill={(hover || value) >= s ? 'var(--color-star)' : 'none'}
            stroke={(hover || value) >= s ? 'var(--color-star)' : '#BDBDBD'}
          />
        </button>
      ))}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct]   = useState<ProductDetail | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const [quantity, setQuantity] = useState(1)
  const [wished, setWished]     = useState(false)
  const [liked, setLiked]       = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [mainImg, setMainImg]   = useState(0)

  const [reviews, setReviews]   = useState<ReviewSummary[]>([])
  const [reviewSortIdx, setReviewSortIdx] = useState(0)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewLikes, setReviewLikes] = useState<Record<number, boolean>>({})

  // 리뷰 작성 폼
  const [writeRating, setWriteRating]   = useState(5)
  const [writeContent, setWriteContent] = useState('')
  const [writeLoading, setWriteLoading] = useState(false)
  const [writeMsg, setWriteMsg]         = useState('')

  const [cartMsg, setCartMsg] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchProduct = async () => {
      try {
        const res = await productsApi.getOne(Number(id))
        setProduct(res.data)
        setWished(res.data.wished)
        setLikeCount(res.data.likeCount)
      } catch {
        setError('상품 정보를 불러올 수 없습니다')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (!id) return
    const fetchReviews = async () => {
      setReviewLoading(true)
      try {
        const opt = REVIEW_SORT_OPTIONS[reviewSortIdx]
        const res = await reviewsApi.getByProduct(Number(id), {
          sortType: 'ratingSortType' in opt ? undefined : opt.sortType,
          ratingSortType: 'ratingSortType' in opt ? (opt as { ratingSortType: string }).ratingSortType : undefined,
        })
        setReviews(res.data)
      } catch {
        setReviews([])
      } finally {
        setReviewLoading(false)
      }
    }
    fetchReviews()
  }, [id, reviewSortIdx])

  const handleWish = async () => {
    if (!product) return
    try {
      const res = await productsApi.wish(product.id)
      setWished(res.data.wished)
    } catch {
      setWished((v) => !v)
    }
  }

  const handleLike = async () => {
    if (!product) return
    if (!user) { navigate('/login'); return }
    try {
      const res = await productsApi.like(product.id)
      setLiked(res.data.liked)
      setLikeCount(res.data.likeCount)
    } catch { /* 무시 */ }
  }

  const handleAddCart = async () => {
    if (!product) return
    try {
      await cartApi.add(product.id, quantity)
      notifyCartChange(quantity)
      setCartMsg('장바구니에 담았습니다!')
      setTimeout(() => setCartMsg(''), 2500)
    } catch (err) {
      setCartMsg(err instanceof ApiError ? err.message : '장바구니 담기 실패')
      setTimeout(() => setCartMsg(''), 2500)
    }
  }

  const handleWriteReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !writeContent.trim()) return
    setWriteLoading(true)
    setWriteMsg('')
    try {
      const res = await reviewsApi.create(product.id, { rating: writeRating, content: writeContent.trim() })
      setReviews((prev) => [
        {
          id: res.data.id,
          user: res.data.user,
          rating: res.data.rating,
          content: res.data.content,
          createdAt: res.data.createdAt,
          image: res.data.images?.[0] ?? '',
          likeCount: 0,
        },
        ...prev,
      ])
      setWriteRating(5)
      setWriteContent('')
      setWriteMsg('리뷰가 등록되었습니다!')
      setTimeout(() => setWriteMsg(''), 3000)
    } catch (err) {
      setWriteMsg(err instanceof ApiError ? err.message : '리뷰 등록 실패')
    } finally {
      setWriteLoading(false)
    }
  }

  const handleReviewLike = async (reviewId: number) => {
    if (!user) { navigate('/login'); return }
    try {
      const res = await reviewsApi.like(reviewId)
      setReviewLikes((prev) => ({ ...prev, [reviewId]: res.data.liked }))
      setReviews((prev) =>
        prev.map((r) => r.id === reviewId ? { ...r, likeCount: res.data.likeCount } : r)
      )
    } catch { /* 무시 */ }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-lg font-medium" style={{ color: 'var(--color-text-disabled)' }}>{error || '상품을 찾을 수 없습니다'}</p>
        <button onClick={() => navigate(-1)} className="text-sm" style={{ color: 'var(--color-primary)' }}>뒤로 가기</button>
      </div>
    )
  }

  const images = product.images?.length > 0
    ? product.images
    : [`https://picsum.photos/seed/prod${product.id}/600/600`]

  const avgRating = product.rating ?? 0
  const reviewCount = reviews.length

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <Breadcrumb
        items={[{ label: '홈', to: '/' }, { label: '상품 목록', to: '/products' }, { label: product.name }]}
      />

      <div className="flex flex-col md:flex-row gap-10 mt-6">
        {/* 이미지 */}
        <div className="flex flex-col gap-3 md:w-[500px] shrink-0">
          <div className="rounded-[8px] overflow-hidden" style={{ aspectRatio: '1/1' }}>
            <img src={images[mainImg] ?? images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((src, i) => (
                <button key={i} onClick={() => setMainImg(i)}
                  className="w-20 h-20 rounded-[8px] overflow-hidden border-2 transition-colors"
                  style={{ borderColor: mainImg === i ? 'var(--color-primary)' : 'transparent' }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-4 flex-1">
          <Link
            to={`/sellers/${product.seller.id}`}
            className="flex items-center gap-1.5 text-sm w-fit transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Store size={13} /> {product.seller.storeName}
          </Link>

          <h1 className="text-[22px] font-bold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
            {product.name}
          </h1>

          {avgRating > 0 && <StarRating rating={avgRating} count={reviewCount} size="md" />}

          <span className="text-[28px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {product.price.toLocaleString()}원
          </span>

          {product.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {product.description}
            </p>
          )}

          <p className="text-xs" style={{ color: product.stock > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
          </p>

          {/* 수량 */}
          <div>
            <p className="text-sm font-medium mb-2">수량</p>
            <div className="flex items-center border rounded-[8px] w-fit" style={{ borderColor: 'var(--color-border)' }}>
              <button className="w-10 h-10 text-lg" onClick={() => setQuantity((v) => Math.max(1, v - 1))}>-</button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button className="w-10 h-10 text-lg" onClick={() => setQuantity((v) => Math.min(product.stock, v + 1))}>+</button>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 mt-2">
            <Button variant="secondary" size="full" onClick={handleAddCart} disabled={product.stock === 0}>
              장바구니 담기
            </Button>
            <Button
              size="full"
              disabled={product.stock === 0}
              onClick={() => navigate('/checkout', {
                state: {
                  items: [{
                    id: product.id,
                    productId: product.id,
                    productName: product.name,
                    quantity,
                    pricePerItem: product.price,
                    totalPrice: product.price * quantity,
                  }],
                },
              })}
            >
              바로 구매하기
            </Button>
            <button
              onClick={handleWish}
              className="w-12 h-12 shrink-0 flex items-center justify-center border rounded-full"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Heart size={20}
                fill={wished ? 'var(--color-primary)' : 'none'}
                stroke={wished ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
            </button>
          </div>

          {cartMsg && (
            <p className="text-sm" style={{ color: cartMsg.includes('실패') ? 'var(--color-error)' : 'var(--color-success)' }}>
              {cartMsg}
            </p>
          )}

          {/* 좋아요 */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 w-fit px-4 py-2 rounded-full border text-sm transition-all hover:opacity-80"
            style={{
              borderColor: liked ? 'var(--color-primary)' : 'var(--color-border)',
              color: liked ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            <ThumbsUp size={15} fill={liked ? 'var(--color-primary)' : 'none'} />
            좋아요 {likeCount}
          </button>

          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <Truck size={16} />
            무료배송 (5만원 이상)
          </div>
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <section className="mt-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">리뷰 ({reviewCount}개)</h2>
        </div>

        {/* 정렬 탭 */}
        <div className="flex gap-4 border-b mb-6" style={{ borderColor: 'var(--color-border)' }}>
          {REVIEW_SORT_OPTIONS.map((opt, i) => (
            <button key={opt.label} onClick={() => setReviewSortIdx(i)}
              className="pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
              style={i === reviewSortIdx
                ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                : { borderColor: 'transparent', color: 'var(--color-text-secondary)' }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* 별점 요약 */}
        {avgRating > 0 && (
          <div className="flex gap-8 py-6 border-b mb-6" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-[40px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {avgRating.toFixed(1)}
              </span>
              <StarRating rating={avgRating} size="lg" showCount={false} />
            </div>
          </div>
        )}

        {/* 리뷰 작성 폼 */}
        {user && (
          <div className="mb-8 p-5 rounded-2xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>리뷰 작성</p>
            <form onSubmit={handleWriteReview} className="flex flex-col gap-3">
              <StarSelector value={writeRating} onChange={setWriteRating} />
              <textarea
                required
                placeholder="이 상품에 대한 솔직한 리뷰를 작성해 주세요."
                value={writeContent}
                onChange={(e) => setWriteContent(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border text-sm resize-none outline-none transition-colors"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm" disabled={writeLoading}>
                  {writeLoading ? '등록 중...' : '리뷰 등록'}
                </Button>
                {writeMsg && (
                  <p className="text-sm" style={{ color: writeMsg.includes('실패') ? 'var(--color-error)' : 'var(--color-success)' }}>
                    {writeMsg}
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 리뷰 목록 */}
        {reviewLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <Star size={32} style={{ color: 'var(--color-text-disabled)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>아직 리뷰가 없습니다</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y" style={{ '--tw-divide-color': 'var(--color-border)' } as React.CSSProperties}>
            {reviews.map((review) => (
              <div key={review.id} className="py-5 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'var(--color-primary)' }}>
                    {review.user.nickname?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.user.nickname}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" showCount={false} />
                {review.image && (
                  <img src={review.image} alt="리뷰 이미지" className="w-16 h-16 rounded-[6px] object-cover" />
                )}
                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{review.content}</p>
                <button
                  onClick={() => handleReviewLike(review.id)}
                  className="flex items-center gap-1.5 text-xs w-fit mt-1 px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
                  style={{
                    borderColor: reviewLikes[review.id] ? 'var(--color-primary)' : 'var(--color-border)',
                    color: reviewLikes[review.id] ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  <ThumbsUp size={12} fill={reviewLikes[review.id] ? 'var(--color-primary)' : 'none'} />
                  도움돼요 {review.likeCount}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

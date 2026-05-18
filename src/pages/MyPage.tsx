import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Heart, MessageSquare, HelpCircle,
  Ticket, Settings, Camera, Store, Trash2, Plus, Pencil, Star, Users,
} from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import StarRating from '../components/ui/StarRating'
import { userApi, type UpdateProfileBody, type UpdatePasswordBody } from '../api/auth'
import { sellersApi, type Seller, type SellerSummary, type CreateSellerBody } from '../api/sellers'
import { ApiError } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { ordersApi, type OrderSummary, ORDER_STATUS_LABEL } from '../api/orders'
import { inquiriesApi, type InquirySummary, type CreateInquiryBody } from '../api/inquiries'
import { couponsApi, type UserCoupon } from '../api/coupons'
import { productsApi, type ProductSummary, type CreateProductBody } from '../api/products'
import { filesApi } from '../api/files'

const SIDEBAR_MENU = [
  { icon: Package,       label: '주문 내역',    key: 'orders',        badge: null },
  { icon: Heart,         label: '찜한 상품',    key: 'wishlist',      badge: null },
  { icon: Users,         label: '관심 상점',    key: 'liked_sellers', badge: null },
  { icon: MessageSquare, label: '내 리뷰',      key: 'reviews',       badge: null },
  { icon: HelpCircle,    label: '문의',          key: 'inquiry',       badge: null },
  { icon: Ticket,        label: '쿠폰 관리',     key: 'coupons',       badge: null },
  { icon: Store,         label: '내 상점',       key: 'shop',          badge: null },
  { icon: Settings,      label: '계정 설정',     key: 'settings',      badge: null },
]

const ORDER_TABS = ['전체', '결제완료', '배송중', '배송완료', '취소신청']

// ── 주문 내역 ─────────────────────────────────────────────────
function OrdersSection() {
  const [orderTab, setOrderTab] = useState('전체')
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)

  useEffect(() => {
    ordersApi.getAll()
      .then((res) => setOrders(res.data?.content ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (orderId: number) => {
    if (!confirm('주문을 취소하시겠습니까?')) return
    setCancelling(orderId)
    try {
      await ordersApi.cancel(orderId)
      setOrders((prev) => prev.map((o) =>
        o.orderId === orderId ? { ...o, orderStatus: 'CANCELLED' as const } : o
      ))
    } catch { /* 무시 */ } finally {
      setCancelling(null)
    }
  }

  const TAB_STATUS: Record<string, string> = {
    '결제완료': 'WAITING',
    '배송중':   'SHIPPED',
    '배송완료': 'DELIVERED',
    '취소신청': 'CANCELLED',
  }

  const filtered = orderTab === '전체'
    ? orders
    : orders.filter((o) => o.orderStatus === TAB_STATUS[orderTab])

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">주문 내역</h2>
      <div className="flex gap-4 border-b mb-5" style={{ borderColor: 'var(--color-border)' }}>
        {ORDER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setOrderTab(tab)}
            className="pb-3 text-sm font-medium border-b-2 transition-colors"
            style={
              tab === orderTab
                ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                : { borderColor: 'transparent', color: 'var(--color-text-secondary)' }
            }
          >
            {tab}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Package size={36} style={{ color: 'var(--color-text-disabled)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>주문 내역이 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((order) => (
            <div key={order.orderId} className="border rounded-[8px] p-4 flex flex-col gap-3"
              style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  주문번호: {order.orderId} · {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: order.orderStatus === 'CANCELLED' ? 'rgba(244,67,54,0.08)' : 'rgba(76,175,80,0.08)',
                    color: order.orderStatus === 'CANCELLED' ? 'var(--color-error)' : 'var(--color-success)',
                  }}
                >
                  {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                </span>
              </div>
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-10 h-10 rounded-[6px] shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--color-border)' }}>
                    <Package size={14} style={{ color: 'var(--color-text-disabled)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.itemPrice.toLocaleString()}원 × {item.quantity}개
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t text-sm font-semibold"
                style={{ borderColor: 'var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>총 결제금액</span>
                <span>{order.totalPrice.toLocaleString()}원</span>
              </div>
              {(order.orderStatus === 'WAITING' || order.orderStatus === 'PAID') && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCancel(order.orderId)}
                    disabled={cancelling === order.orderId}
                    className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                  >
                    {cancelling === order.orderId ? '취소 중...' : '주문 취소'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── 찜한 상품 / 좋아요 상품 ───────────────────────────────────
function WishlistSection() {
  const [tab, setTab] = useState<'wish' | 'liked'>('wish')
  const [wishProducts, setWishProducts]   = useState<ProductSummary[]>([])
  const [likedProducts, setLikedProducts] = useState<ProductSummary[]>([])
  const [wishLoading, setWishLoading]   = useState(true)
  const [likedLoading, setLikedLoading] = useState(false)
  const [likedFetched, setLikedFetched] = useState(false)

  useEffect(() => {
    userApi.getWishProducts()
      .then((res) => setWishProducts(res.data ?? []))
      .catch(() => setWishProducts([]))
      .finally(() => setWishLoading(false))
  }, [])

  useEffect(() => {
    if (tab !== 'liked' || likedFetched) return
    setLikedLoading(true)
    userApi.getLikedProducts()
      .then((res) => { setLikedProducts(res.data ?? []); setLikedFetched(true) })
      .catch(() => setLikedProducts([]))
      .finally(() => setLikedLoading(false))
  }, [tab, likedFetched])

  const loading  = tab === 'wish' ? wishLoading  : likedLoading
  const products = tab === 'wish' ? wishProducts : likedProducts
  const empty    = tab === 'wish' ? '찜한 상품이 없습니다' : '좋아요한 상품이 없습니다'

  return (
    <section>
      <div className="flex gap-4 border-b mb-5" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { key: 'wish'  as const, label: '찜한 상품' },
          { key: 'liked' as const, label: '좋아요 상품' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="pb-3 text-sm font-medium border-b-2 transition-colors"
            style={tab === key
              ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
              : { borderColor: 'transparent', color: 'var(--color-text-secondary)' }}>
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm py-10 text-center" style={{ color: 'var(--color-text-disabled)' }}>{empty}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} size="small" />
          ))}
        </div>
      )}
    </section>
  )
}


// ── 내 리뷰 ───────────────────────────────────────────────────
function ReviewsSection() {
  const [reviews, setReviews] = useState<import('../api/reviews').ReviewDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editContent, setEditContent] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editHoverRating, setEditHoverRating] = useState(0)

  useEffect(() => {
    userApi.getMyReviews()
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (reviewId: number) => {
    const { reviewsApi } = await import('../api/reviews')
    try {
      await reviewsApi.remove(reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch { /* 무시 */ }
  }

  const handleStartEdit = (review: import('../api/reviews').ReviewDetail) => {
    setEditingId(review.id)
    setEditRating(review.rating)
    setEditContent(review.content)
    setEditHoverRating(0)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setEditSaving(true)
    const { reviewsApi } = await import('../api/reviews')
    try {
      const res = await reviewsApi.update(editingId, { rating: editRating, content: editContent })
      setReviews((prev) => prev.map((r) => r.id === editingId ? res.data : r))
      setEditingId(null)
    } catch { /* 무시 */ } finally {
      setEditSaving(false)
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-1">내 리뷰</h2>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm py-10 text-center" style={{ color: 'var(--color-text-disabled)' }}>작성한 리뷰가 없습니다</p>
      ) : (
        <>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>총 {reviews.length}개의 리뷰</p>
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-[8px] p-4 flex flex-col gap-3"
                style={{ borderColor: 'var(--color-border)' }}>
                {/* 상품 정보 */}
                <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-10 h-10 rounded-[6px] shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--color-border)' }}>
                    <Package size={14} style={{ color: 'var(--color-text-disabled)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {review.product?.seller?.storeName}
                    </p>
                    <p className="text-sm font-medium truncate">{review.product?.name}</p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>

                {editingId === review.id ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setEditRating(n)}
                          onMouseEnter={() => setEditHoverRating(n)}
                          onMouseLeave={() => setEditHoverRating(0)}
                        >
                          <Star
                            size={22}
                            fill={(editHoverRating || editRating) >= n ? 'var(--color-star)' : 'none'}
                            style={{ color: 'var(--color-star)' }}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      placeholder="리뷰 내용을 입력하세요"
                      className="w-full px-3 py-2 text-sm border rounded-xl resize-none outline-none"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >취소</button>
                      <Button size="sm" onClick={handleSaveEdit} disabled={editSaving}>
                        {editSaving ? '저장 중...' : '저장'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <StarRating rating={review.rating} size="sm" showCount={false} />
                    {review.images?.length > 0 && (
                      <div className="flex gap-2">
                        {review.images.map((src, i) => (
                          <img key={i} src={src} alt={`리뷰 사진 ${i + 1}`}
                            className="w-16 h-16 rounded-[6px] object-cover" />
                        ))}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                      {review.content}
                    </p>
                  </>
                )}

                <div className="flex items-center justify-end gap-3 pt-2 border-t"
                  style={{ borderColor: 'var(--color-border)' }}>
                  {editingId !== review.id && (
                    <button
                      onClick={() => handleStartEdit(review)}
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <Pencil size={12} /> 수정
                    </button>
                  )}
                  <button onClick={() => handleDelete(review.id)}
                    className="text-xs" style={{ color: 'var(--color-error)' }}>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

// ── 문의 ──────────────────────────────────────────────────────
function InquirySection() {
  const navigate = useNavigate()
  const [inquiries, setInquiries] = useState<InquirySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    inquiriesApi.getMyInquiries()
      .then((res) => setInquiries(res.data ?? []))
      .catch(() => setInquiries([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">문의</h2>
        <Button size="sm" variant="secondary" onClick={() => navigate('/inquiry')}>문의하기</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <HelpCircle size={36} style={{ color: 'var(--color-text-disabled)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>문의 내역이 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {inquiries.map((inq) => (
            <div key={inq.inquiryId} className="border rounded-[8px] p-4"
              style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium flex-1 min-w-0 truncate">{inq.title}</p>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: inq.status === 'ANSWERED' ? 'rgba(76,175,80,0.08)' : 'rgba(255,152,0,0.08)',
                    color: inq.status === 'ANSWERED' ? 'var(--color-success)' : '#F57C00',
                  }}
                >
                  {inq.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {new Date(inq.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── 관심 상점 (좋아요 + 팔로우) ────────────────────────────────
function LikedSellersSection() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'liked' | 'followed'>('liked')
  const [likedSellers,    setLikedSellers]    = useState<SellerSummary[]>([])
  const [followedSellers, setFollowedSellers] = useState<SellerSummary[]>([])
  const [likedLoading,    setLikedLoading]    = useState(true)
  const [followedLoading, setFollowedLoading] = useState(false)
  const [followedFetched, setFollowedFetched] = useState(false)

  useEffect(() => {
    userApi.getLikedSellers()
      .then((res) => setLikedSellers(res.data ?? []))
      .catch(() => setLikedSellers([]))
      .finally(() => setLikedLoading(false))
  }, [])

  useEffect(() => {
    if (tab !== 'followed' || followedFetched) return
    setFollowedLoading(true)
    userApi.getFollowedSellers()
      .then((res) => { setFollowedSellers(res.data ?? []); setFollowedFetched(true) })
      .catch(() => setFollowedSellers([]))
      .finally(() => setFollowedLoading(false))
  }, [tab, followedFetched])

  const loading = tab === 'liked' ? likedLoading : followedLoading
  const sellers = tab === 'liked' ? likedSellers : followedSellers
  const empty   = tab === 'liked' ? '좋아요한 상점이 없습니다' : '팔로우한 상점이 없습니다'

  return (
    <section>
      <div className="flex gap-4 border-b mb-5" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { key: 'liked'    as const, label: '좋아요 상점' },
          { key: 'followed' as const, label: '팔로우 상점' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="pb-3 text-sm font-medium border-b-2 transition-colors"
            style={tab === key
              ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
              : { borderColor: 'transparent', color: 'var(--color-text-secondary)' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Users size={36} style={{ color: 'var(--color-text-disabled)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>{empty}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sellers.map((seller) => (
            <div key={seller.id}
              className="flex items-center gap-3 p-3 rounded-[8px] border cursor-pointer hover:bg-[#FAFAFA] transition-colors"
              style={{ borderColor: 'var(--color-border)' }}
              onClick={() => navigate(`/sellers/${seller.id}`)}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}>
                {seller.image
                  ? <img src={seller.image} alt={seller.storeName} className="w-full h-full object-cover" />
                  : <Store size={16} color="#fff" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{seller.storeName}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  팔로워 {seller.followCount} · 좋아요 {seller.likeCount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── 쿠폰 관리 ─────────────────────────────────────────────────
function CouponsSection() {
  const [tab, setTab] = useState<'available' | 'used'>('available')
  const [coupons, setCoupons] = useState<UserCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registerMsg, setRegisterMsg] = useState('')

  useEffect(() => {
    couponsApi.getMyCoupons()
      .then((res) => setCoupons(res.data ?? []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false))
  }, [])

  const handleRegister = async () => {
    if (!code.trim()) return
    setRegistering(true)
    setRegisterMsg('')
    try {
      const res = await couponsApi.register(code.trim())
      setCoupons((prev) => [...prev, res.data])
      setCode('')
      setRegisterMsg('쿠폰이 등록되었습니다!')
    } catch (err) {
      setRegisterMsg(err instanceof ApiError ? err.message : '쿠폰 등록 실패')
    } finally {
      setRegistering(false)
    }
  }

  const available = coupons.filter((c) => !c.used)
  const used = coupons.filter((c) => c.used)
  const shown = tab === 'available' ? available : used

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">쿠폰 관리</h2>

      <div className="flex gap-4 border-b mb-5" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { key: 'available' as const, label: `사용 가능 (${available.length})` },
          { key: 'used' as const,      label: `사용 완료 (${used.length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="pb-3 text-sm font-medium border-b-2 transition-colors"
            style={
              tab === key
                ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                : { borderColor: 'transparent', color: 'var(--color-text-secondary)' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'available' && (
        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="쿠폰 코드를 입력하세요"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRegister() } }}
              className="flex-1 h-10 px-3 text-sm border-2 rounded-xl outline-none transition-all focus:border-[#FF3D87]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <Button size="sm" onClick={handleRegister} disabled={registering}>
              {registering ? '등록 중...' : '등록'}
            </Button>
          </div>
          {registerMsg && (
            <p className="text-xs" style={{
              color: registerMsg.includes('실패') || registerMsg.includes('오류') ? 'var(--color-error)' : 'var(--color-success)'
            }}>
              {registerMsg}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Ticket size={36} style={{ color: 'var(--color-text-disabled)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>쿠폰이 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((c) => (
            <div key={c.userCouponId}
              className="flex items-center justify-between border rounded-[8px] px-4 py-3"
              style={{ borderColor: 'var(--color-border)', opacity: c.used ? 0.5 : 1 }}>
              <div>
                <p className="text-sm font-semibold">
                  {c.discountType === 'RATE' ? `${c.discountValue}% 할인` : `${c.discountValue.toLocaleString()}원 할인`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {c.minOrderPrice > 0 && `${c.minOrderPrice.toLocaleString()}원 이상 구매 시 · `}
                  {new Date(c.expiresAt).toLocaleDateString('ko-KR')} 만료
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: c.used ? 'var(--color-border)' : 'rgba(124,58,237,0.08)',
                  color: c.used ? 'var(--color-text-disabled)' : 'var(--color-primary)',
                }}>
                {c.used ? '사용완료' : '사용가능'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── 계정 설정 ─────────────────────────────────────────────────
function SettingsSection() {
  const { user, refreshUser } = useAuth()

  const [nickname, setNickname] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)

  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  const [notification, setNotification] = useState({ email: true, sms: false, push: true })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const passwordStrength =
    newPassword.length === 0 ? 0
    : newPassword.length < 6 ? 1
    : newPassword.length < 10 ? 2
    : 3
  const strengthLabel = ['', '약함', '보통', '강함'][passwordStrength]
  const strengthColor = ['', 'var(--color-error)', 'var(--color-star)', 'var(--color-success)'][passwordStrength]

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfile()
        setNickname(res.data.nickname)
        setProfileImage(res.data.profileImage ?? null)
      } catch {
        if (user) setNickname(user.nickname)
      } finally {
        setProfileLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const url = await filesApi.upload(file, 'PROFILE')
      await userApi.updateProfile({ profileImage: url })
      setProfileImage(url)
      await refreshUser()
    } catch { /* 무시 */ } finally {
      setPhotoUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileError('')
    setProfileSaving(true)
    try {
      const body: UpdateProfileBody = { nickname }
      await userApi.updateProfile(body)
      await refreshUser()
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : '저장 중 오류가 발생했습니다')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPwError('')
    if (newPassword !== confirmPassword) {
      setPwError('새 비밀번호가 일치하지 않습니다')
      return
    }
    setPwSaving(true)
    try {
      const body: UpdatePasswordBody = { password, newPassword }
      await userApi.updatePassword(body)
      setPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 2500)
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : '비밀번호 변경 중 오류가 발생했습니다')
    } finally {
      setPwSaving(false)
    }
  }

  if (profileLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6">계정 설정</h2>
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-6">계정 설정</h2>
      <div className="flex flex-col gap-8">

        {/* 프로필 폼 */}
        <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            프로필
          </h3>

          {/* 아바타 */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="프로필"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {user?.nickname?.charAt(0).toUpperCase() ?? 'U'}
                </div>
              )}
              <button
                type="button"
                disabled={photoUploading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-text-primary)' }}
              >
                {photoUploading
                  ? <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin border-white" />
                  : <Camera size={12} color="#fff" />
                }
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium">프로필 사진 변경</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                JPG, PNG 최대 5MB
              </p>
            </div>
          </div>

          <Input
            label="이메일"
            type="email"
            value={user?.email ?? ''}
            readOnly
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
          <Input
            label="닉네임"
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          {profileError && (
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{profileError}</p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={profileSaving}>
              {profileSaving ? '저장 중...' : '프로필 저장'}
            </Button>
            {profileSaved && (
              <p className="text-sm" style={{ color: 'var(--color-success)' }}>저장되었습니다!</p>
            )}
          </div>
        </form>

        {/* 구분선 */}
        <div className="h-px" style={{ background: 'var(--color-border)' }} />

        {/* 비밀번호 변경 폼 */}
        <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            비밀번호 변경
          </h3>
          <Input
            label="현재 비밀번호"
            type="password"
            placeholder="현재 비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <Input
              label="새 비밀번호"
              type="password"
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword.length > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(passwordStrength / 3) * 100}%`, background: strengthColor }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>
          <Input
            label="새 비밀번호 확인"
            type="password"
            placeholder="새 비밀번호 재입력"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={
              confirmPassword.length > 0 && confirmPassword !== newPassword
                ? '비밀번호가 일치하지 않아요'
                : undefined
            }
          />

          {pwError && (
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{pwError}</p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pwSaving}>
              {pwSaving ? '변경 중...' : '비밀번호 변경'}
            </Button>
            {pwSaved && (
              <p className="text-sm" style={{ color: 'var(--color-success)' }}>변경되었습니다!</p>
            )}
          </div>
        </form>

        {/* 구분선 */}
        <div className="h-px" style={{ background: 'var(--color-border)' }} />

        {/* 알림 설정 */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            알림 설정
          </h3>
          {[
            { key: 'email' as const, label: '이메일 알림', desc: '주문, 배송 관련 이메일 알림을 받습니다' },
            { key: 'sms'   as const, label: 'SMS 알림',   desc: '주문, 배송 관련 문자 알림을 받습니다' },
            { key: 'push'  as const, label: '푸시 알림',   desc: '앱 푸시 알림을 통해 소식을 받습니다' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotification((prev) => ({ ...prev, [key]: !prev[key] }))}
                className="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
                style={{
                  background: notification[key] ? 'var(--color-primary)' : 'var(--color-border)',
                }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                  style={{ left: notification[key] ? 'calc(100% - 20px)' : '4px' }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="h-px" style={{ background: 'var(--color-border)' }} />

        {/* 계정 탈퇴 */}
        <div className="pt-2">
          <button
            type="button"
            className="text-xs"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            회원 탈퇴
          </button>
        </div>
      </div>
    </section>
  )
}

// ── 내 상점 섹션 ──────────────────────────────────────────────
function ShopSection() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [shop, setShop] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [shopImage, setShopImage] = useState<string | undefined>(undefined)
  const [shopImageUploading, setShopImageUploading] = useState(false)
  const shopImageRef = useRef<HTMLInputElement>(null)

  // 탭
  const [shopTab, setShopTab] = useState<'info' | 'products' | 'inquiries' | 'orders'>('info')
  const [myProducts, setMyProducts] = useState<ProductSummary[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductSummary | null>(null)
  const [pName, setPName] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pStock, setPStock] = useState('')
  const [pCategory, setPCategory] = useState('BEAUTY')
  const [pImages, setPImages] = useState<string[]>([])
  const [pImageUploading, setPImageUploading] = useState(false)
  const [pSaving, setPSaving] = useState(false)
  const [pDeleting, setPDeleting] = useState<number | null>(null)
  const [pError, setPError] = useState('')
  const productFileRef = useRef<HTMLInputElement>(null)

  // 받은 문의
  const [sellerInquiries, setSellerInquiries] = useState<InquirySummary[]>([])
  const [inquiriesLoading, setInquiriesLoading] = useState(false)
  const [inquiriesFetched, setInquiriesFetched] = useState(false)
  const [answeringId, setAnsweringId] = useState<number | null>(null)
  const [answerContent, setAnswerContent] = useState('')
  const [answerSaving, setAnswerSaving] = useState(false)

  // 주문 관리
  const [sellerOrders, setSellerOrders] = useState<OrderSummary[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersFetched, setOrdersFetched] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    userApi.getMySeller()
      .then((res) => {
        setShop(res.data)
        setStoreName(res.data.storeName)
        setDescription(res.data.description)
        setShopImage(res.data.image || undefined)
      })
      .catch(() => { /* 상점 없음 */ })
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (shopTab !== 'products' || !shop) return
    setProductsLoading(true)
    userApi.getMyProducts()
      .then((res) => setMyProducts(res.data ?? []))
      .catch(() => setMyProducts([]))
      .finally(() => setProductsLoading(false))
  }, [shopTab, shop])

  useEffect(() => {
    if (shopTab !== 'inquiries' || !shop || inquiriesFetched) return
    setInquiriesLoading(true)
    inquiriesApi.getMyInquiries()
      .then((res) => { setSellerInquiries(res.data ?? []); setInquiriesFetched(true) })
      .catch(() => setSellerInquiries([]))
      .finally(() => setInquiriesLoading(false))
  }, [shopTab, shop, inquiriesFetched])

  useEffect(() => {
    if (shopTab !== 'orders' || !shop || ordersFetched) return
    setOrdersLoading(true)
    ordersApi.getAll()
      .then((res) => { setSellerOrders(res.data?.content ?? []); setOrdersFetched(true) })
      .catch(() => setSellerOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [shopTab, shop, ordersFetched])

  const handleAnswerInquiry = async (inquiryId: number) => {
    if (!answerContent.trim()) return
    setAnswerSaving(true)
    try {
      await inquiriesApi.answer(inquiryId, answerContent.trim())
      setSellerInquiries((prev) => prev.map((i) =>
        i.inquiryId === inquiryId ? { ...i, status: 'ANSWERED' as const, answerContent: answerContent.trim() } : i
      ))
      setAnsweringId(null)
      setAnswerContent('')
    } catch { /* 무시 */ } finally {
      setAnswerSaving(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    setUpdatingOrderId(orderId)
    try {
      await ordersApi.updateStatus(orderId, status)
      setSellerOrders((prev) => prev.map((o) =>
        o.orderId === orderId ? { ...o, orderStatus: status as OrderSummary['orderStatus'] } : o
      ))
    } catch { /* 무시 */ } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleShopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setShopImageUploading(true)
    try {
      const url = await filesApi.upload(file, 'PROFILE')
      setShopImage(url)
    } catch { /* 무시 */ } finally {
      setShopImageUploading(false)
      if (shopImageRef.current) shopImageRef.current.value = ''
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body: CreateSellerBody = { storeName, description, ...(shopImage ? { image: shopImage } : {}) }
      const res = await sellersApi.create(body)
      setShop(res.data)
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '상점 개설 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!shop) return
    setError('')
    setSaving(true)
    try {
      const res = await sellersApi.update(shop.id, { storeName, description, ...(shopImage ? { image: shopImage } : {}) })
      setShop(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '상점 수정 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!shop) return
    setDeleting(true)
    try {
      await sellersApi.remove(shop.id)
      setShop(null)
      setStoreName('')
      setDescription('')
      setShopImage(undefined)
      setConfirmDelete(false)
      await refreshUser()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '상점 삭제 중 오류가 발생했습니다')
    } finally {
      setDeleting(false)
    }
  }

  const openAddForm = () => {
    setEditingProduct(null)
    setPName(''); setPPrice(''); setPDesc(''); setPStock('')
    setPCategory('BEAUTY'); setPImages([]); setPError('')
    setShowProductForm(true)
  }

  const openEditForm = async (product: ProductSummary) => {
    setEditingProduct(product)
    setPName(product.name)
    setPPrice(String(product.price))
    setPDesc('')
    setPStock('')
    setPCategory('BEAUTY')
    setPImages(product.image ? [product.image] : [])
    setPError('')
    setShowProductForm(true)
    try {
      const res = await productsApi.getOne(product.id)
      const d = res.data
      setPDesc(d.description)
      setPStock(String(d.stock))
      setPCategory(d.category)
      setPImages(d.images ?? [])
    } catch { /* 기본값 유지 */ }
  }

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPImageUploading(true)
    try {
      const url = await filesApi.upload(file, 'PRODUCT')
      setPImages((prev) => [...prev, url])
    } catch { /* 무시 */ } finally {
      setPImageUploading(false)
      if (productFileRef.current) productFileRef.current.value = ''
    }
  }

  const handleProductSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPError('')
    setPSaving(true)
    try {
      const body: CreateProductBody = {
        name: pName,
        price: Number(pPrice),
        description: pDesc,
        stock: Number(pStock),
        images: pImages,
        category: pCategory,
      }
      if (editingProduct) {
        await productsApi.update(editingProduct.id, body)
      } else {
        await productsApi.create(body)
      }
      setShowProductForm(false)
      const res = await userApi.getMyProducts()
      setMyProducts(res.data ?? [])
    } catch (err) {
      setPError(err instanceof ApiError ? err.message : '저장 중 오류가 발생했습니다')
    } finally {
      setPSaving(false)
    }
  }

  const handleProductDelete = async (productId: number) => {
    if (!confirm('상품을 삭제하시겠습니까?')) return
    setPDeleting(productId)
    try {
      await productsApi.remove(productId)
      setMyProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch { /* 무시 */ } finally {
      setPDeleting(null)
    }
  }

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6">내 상점</h2>
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-6">내 상점</h2>

      {shop ? (
        <div className="flex flex-col gap-6">
          {/* 상점 미리보기 링크 */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl border"
            style={{ borderColor: 'var(--color-border)', background: '#FAFAFA' }}
          >
            <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}>
              {shop.image
                ? <img src={shop.image} alt={shop.storeName} className="w-full h-full object-cover" />
                : <Store size={20} color="#fff" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{shop.storeName}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                팔로워 {shop.followCount} · 좋아요 {shop.likeCount}
              </p>
            </div>
            <button
              onClick={() => navigate(`/sellers/${shop.id}`)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors hover:bg-white"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              상점 보기
            </button>
          </div>

          {/* 탭 */}
          <div className="flex gap-4 border-b overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
            {[
              { key: 'info'      as const, label: '상점 정보' },
              { key: 'products'  as const, label: '상품 관리' },
              { key: 'inquiries' as const, label: '받은 문의' },
              { key: 'orders'    as const, label: '주문 관리' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setShopTab(key)}
                className="pb-3 text-sm font-medium border-b-2 transition-colors shrink-0"
                style={
                  shopTab === key
                    ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                    : { borderColor: 'transparent', color: 'var(--color-text-secondary)' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {shopTab === 'info' ? (
            <>
              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                {/* 상점 이미지 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>상점 이미지</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0"
                      style={{ background: 'var(--color-border)' }}>
                      {shopImage
                        ? <img src={shopImage} alt="상점" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Store size={20} style={{ color: 'var(--color-text-disabled)' }} />
                          </div>
                      }
                    </div>
                    <button
                      type="button"
                      disabled={shopImageUploading}
                      onClick={() => shopImageRef.current?.click()}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                    >
                      {shopImageUploading ? '업로드 중...' : '이미지 변경'}
                    </button>
                    {shopImage && (
                      <button type="button" onClick={() => setShopImage(undefined)}
                        className="text-xs" style={{ color: 'var(--color-error)' }}>삭제</button>
                    )}
                    <input ref={shopImageRef} type="file" accept="image/*"
                      onChange={handleShopImageUpload} className="hidden" />
                  </div>
                </div>

                <Input
                  label="상점 이름"
                  placeholder="상점 이름 입력"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>상점 소개</label>
                  <textarea
                    placeholder="상점 소개를 입력하세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border text-sm resize-none outline-none transition-colors"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? '저장 중...' : '상점 정보 저장'}
                  </Button>
                  {saved && <p className="text-sm" style={{ color: 'var(--color-success)' }}>저장되었습니다!</p>}
                </div>
              </form>

              <div className="pt-2">
                {confirmDelete ? (
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl border"
                    style={{ borderColor: 'var(--color-error)', background: 'rgba(244,67,54,0.04)' }}
                  >
                    <p className="flex-1 text-sm" style={{ color: 'var(--color-error)' }}>
                      정말 상점을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </p>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: 'var(--color-error)', color: '#fff' }}
                    >
                      {deleting ? '삭제 중...' : '삭제'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-sm px-3 py-1.5 rounded-lg"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: 'var(--color-text-disabled)' }}
                  >
                    <Trash2 size={13} /> 상점 삭제
                  </button>
                )}
              </div>
            </>
          ) : shopTab === 'inquiries' ? (
            // 받은 문의 탭
            <div className="flex flex-col gap-3">
              {inquiriesLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                </div>
              ) : sellerInquiries.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <HelpCircle size={36} style={{ color: 'var(--color-text-disabled)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>받은 문의가 없습니다</p>
                </div>
              ) : (
                sellerInquiries.map((inq) => (
                  <div key={inq.inquiryId} className="border rounded-[8px] p-4 flex flex-col gap-2"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{inq.title}</p>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: inq.status === 'ANSWERED' ? 'rgba(76,175,80,0.08)' : 'rgba(255,152,0,0.08)',
                          color: inq.status === 'ANSWERED' ? 'var(--color-success)' : '#F57C00',
                        }}>
                        {inq.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{inq.content}</p>
                    {inq.answerContent && (
                      <div className="p-3 rounded-lg text-xs"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
                        <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>답변: </span>
                        {inq.answerContent}
                      </div>
                    )}
                    {inq.status === 'PENDING' && (
                      answeringId === inq.inquiryId ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                            rows={3}
                            placeholder="답변 내용을 입력하세요"
                            className="w-full px-3 py-2 text-sm border rounded-xl resize-none outline-none"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => { setAnsweringId(null); setAnswerContent('') }}
                              className="text-xs px-3 py-1.5 rounded-lg"
                              style={{ color: 'var(--color-text-secondary)' }}>취소</button>
                            <Button size="sm" onClick={() => handleAnswerInquiry(inq.inquiryId)} disabled={answerSaving}>
                              {answerSaving ? '저장 중...' : '답변 등록'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAnsweringId(inq.inquiryId); setAnswerContent('') }}
                          className="self-start text-xs px-3 py-1.5 rounded-lg border transition-colors"
                          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                        >답변하기</button>
                      )
                    )}
                  </div>
                ))
              )}
            </div>
          ) : shopTab === 'orders' ? (
            // 주문 관리 탭
            <div className="flex flex-col gap-3">
              {ordersLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                </div>
              ) : sellerOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <Package size={36} style={{ color: 'var(--color-text-disabled)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>주문 내역이 없습니다</p>
                </div>
              ) : (
                sellerOrders.map((order) => (
                  <div key={order.orderId} className="border rounded-[8px] p-4 flex flex-col gap-2"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        주문번호 {order.orderId} · {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: order.orderStatus === 'CANCELLED' ? 'rgba(244,67,54,0.08)' : 'rgba(76,175,80,0.08)',
                          color: order.orderStatus === 'CANCELLED' ? 'var(--color-error)' : 'var(--color-success)',
                        }}>
                        {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{order.totalPrice.toLocaleString()}원</p>
                    {(order.orderStatus === 'WAITING' || order.orderStatus === 'PAID') && (
                      <div className="flex gap-2 flex-wrap mt-1">
                        {['SHIPPED', 'DELIVERED'].map((s) => (
                          <button key={s}
                            onClick={() => handleUpdateOrderStatus(order.orderId, s)}
                            disabled={updatingOrderId === order.orderId}
                            className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                          >
                            {s === 'SHIPPED' ? '배송중으로 변경' : '배송완료로 변경'}
                          </button>
                        ))}
                      </div>
                    )}
                    {order.orderStatus === 'SHIPPED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.orderId, 'DELIVERED')}
                        disabled={updatingOrderId === order.orderId}
                        className="self-start text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                        style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                      >배송완료로 변경</button>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            // 상품 관리 탭
            <div className="flex flex-col gap-4">
              {!showProductForm && (
                <div className="flex justify-end">
                  <Button size="sm" onClick={openAddForm}>
                    <Plus size={14} className="mr-1" /> 상품 추가
                  </Button>
                </div>
              )}

              {showProductForm && (
                <div className="border rounded-[8px] p-4" style={{ borderColor: 'var(--color-border)' }}>
                  <form onSubmit={handleProductSave} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{editingProduct ? '상품 수정' : '상품 추가'}</h3>
                      <button type="button" onClick={() => setShowProductForm(false)}
                        className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        취소
                      </button>
                    </div>

                    <Input label="상품명" placeholder="상품명 입력" value={pName}
                      onChange={(e) => setPName(e.target.value)} required />

                    <div className="flex gap-3">
                      <Input label="가격 (원)" type="number" placeholder="0" value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)} required />
                      <Input label="재고" type="number" placeholder="0" value={pStock}
                        onChange={(e) => setPStock(e.target.value)} required />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>카테고리</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: 'BEAUTY',      label: '뷰티' },
                          { value: 'FASHION',     label: '패션' },
                          { value: 'FOOD',        label: '식품' },
                          { value: 'ELECTRONICS', label: '가전' },
                        ].map(({ value, label }) => (
                          <button key={value} type="button" onClick={() => setPCategory(value)}
                            className="px-3 py-1.5 text-xs rounded-full border transition-colors"
                            style={pCategory === value
                              ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                              : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
                            }
                          >{label}</button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>상품 설명</label>
                      <textarea
                        value={pDesc}
                        onChange={(e) => setPDesc(e.target.value)}
                        rows={3}
                        placeholder="상품 설명을 입력하세요"
                        className="w-full px-3 py-2 text-sm border rounded-xl resize-none outline-none"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>상품 이미지</label>
                      <div className="flex gap-2 flex-wrap">
                        {pImages.map((url, i) => (
                          <div key={i} className="relative w-16 h-16">
                            <img src={url} alt={`상품 이미지 ${i + 1}`}
                              className="w-16 h-16 rounded-[6px] object-cover" />
                            <button
                              type="button"
                              onClick={() => setPImages((prev) => prev.filter((_, idx) => idx !== i))}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border flex items-center justify-center text-xs leading-none"
                              style={{ borderColor: 'var(--color-border)', color: 'var(--color-error)' }}
                            >×</button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => productFileRef.current?.click()}
                          disabled={pImageUploading}
                          className="w-16 h-16 rounded-[6px] border-2 border-dashed flex items-center justify-center"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-disabled)' }}
                        >
                          {pImageUploading
                            ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                            : <Plus size={16} />
                          }
                        </button>
                      </div>
                      <input ref={productFileRef} type="file" accept="image/*"
                        onChange={handleProductImageUpload} className="hidden" />
                    </div>

                    {pError && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{pError}</p>}

                    <Button type="submit" disabled={pSaving}>
                      {pSaving ? '저장 중...' : editingProduct ? '수정 저장' : '상품 등록'}
                    </Button>
                  </form>
                </div>
              )}

              {productsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                </div>
              ) : myProducts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <Package size={36} style={{ color: 'var(--color-text-disabled)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>등록된 상품이 없습니다</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-[8px] border"
                      style={{ borderColor: 'var(--color-border)' }}>
                      {product.image ? (
                        <img src={product.image} alt={product.name}
                          className="w-12 h-12 rounded-[6px] object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-[6px] shrink-0 flex items-center justify-center"
                          style={{ background: 'var(--color-border)' }}>
                          <Package size={16} style={{ color: 'var(--color-text-disabled)' }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                          {product.price.toLocaleString()}원
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openEditForm(product)}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition-colors"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                        >
                          <Pencil size={11} /> 수정
                        </button>
                        <button
                          onClick={() => handleProductDelete(product.id)}
                          disabled={pDeleting === product.id}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition-colors"
                          style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                        >
                          <Trash2 size={11} /> {pDeleting === product.id ? '...' : '삭제'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // 상점이 없는 경우 - 개설 폼
        <div className="flex flex-col gap-6">
          <div
            className="flex flex-col items-center gap-2 py-8 rounded-2xl border"
            style={{ borderColor: 'var(--color-border)', background: '#FAFAFA' }}
          >
            <Store size={36} style={{ color: 'var(--color-text-disabled)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              아직 개설된 상점이 없습니다
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              상점을 개설하고 상품을 판매해보세요
            </p>
          </div>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            {/* 상점 이미지 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>상점 이미지 (선택)</label>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0"
                  style={{ background: 'var(--color-border)' }}>
                  {shopImage
                    ? <img src={shopImage} alt="상점" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Store size={20} style={{ color: 'var(--color-text-disabled)' }} />
                      </div>
                  }
                </div>
                <button
                  type="button"
                  disabled={shopImageUploading}
                  onClick={() => shopImageRef.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  {shopImageUploading ? '업로드 중...' : '이미지 선택'}
                </button>
                {shopImage && (
                  <button type="button" onClick={() => setShopImage(undefined)}
                    className="text-xs" style={{ color: 'var(--color-error)' }}>삭제</button>
                )}
                <input ref={shopImageRef} type="file" accept="image/*"
                  onChange={handleShopImageUpload} className="hidden" />
              </div>
            </div>

            <Input
              label="상점 이름"
              placeholder="상점 이름 입력"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>상점 소개</label>
              <textarea
                placeholder="상점 소개를 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border text-sm resize-none outline-none transition-colors"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}

            <Button type="submit" disabled={saving}>
              {saving ? '개설 중...' : '상점 개설하기'}
            </Button>
          </form>
        </div>
      )}
    </section>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function MyPage() {
  const { user } = useAuth()
  const [activeMenu, setActiveMenu] = useState('orders')

  const renderContent = () => {
    switch (activeMenu) {
      case 'orders':        return <OrdersSection />
      case 'wishlist':      return <WishlistSection />
      case 'liked_sellers': return <LikedSellersSection />
      case 'reviews':       return <ReviewsSection />
      case 'inquiry':       return <InquirySection />
      case 'coupons':       return <CouponsSection />
      case 'shop':          return <ShopSection />
      case 'settings':      return <SettingsSection />
      default:         return null
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-[200px] shrink-0 hidden md:block">
          {/* 프로필 */}
          <div
            className="flex flex-col items-center gap-2 pb-5 border-b mb-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              {user?.nickname?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">{user?.nickname ?? ''}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {user?.email ?? ''}
              </p>
              {user?.role === 'SELLER' && (
                <span
                  className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--color-primary)' }}
                >
                  판매자
                </span>
              )}
            </div>
            <button
              className="text-xs"
              style={{ color: 'var(--color-primary)' }}
              onClick={() => setActiveMenu('settings')}
            >
              프로필 편집
            </button>
          </div>

          {/* 메뉴 */}
          <nav className="flex flex-col gap-1">
            {SIDEBAR_MENU.map(({ icon: Icon, label, key, badge }) => (
              <button
                key={key}
                onClick={() => setActiveMenu(key)}
                className="flex items-center justify-between px-3 py-2.5 rounded-[8px] text-sm font-medium transition-colors w-full text-left"
                style={
                  activeMenu === key
                    ? { background: 'var(--color-surface)', color: 'var(--color-primary)' }
                    : { color: 'var(--color-text-secondary)' }
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={16} />
                  {label}
                </span>
                {badge && (
                  <span
                    className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* 모바일 탭 */}
        <div className="flex md:hidden overflow-x-auto pb-1 mb-4 w-full gap-2">
          {SIDEBAR_MENU.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => setActiveMenu(key)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={
                activeMenu === key
                  ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                  : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

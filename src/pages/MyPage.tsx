import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Heart, MessageSquare, HelpCircle,
  Ticket, Settings, ChevronDown, ChevronUp, Camera, Store, Trash2,
} from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import StarRating from '../components/ui/StarRating'
import { userApi, type UpdateProfileBody, type UpdatePasswordBody } from '../api/auth'
import { sellersApi, type Seller, type CreateSellerBody } from '../api/sellers'
import { ApiError } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

const SIDEBAR_MENU = [
  { icon: Package,       label: '주문 내역',    key: 'orders',   badge: null },
  { icon: Heart,         label: '찜한 상품',    key: 'wishlist', badge: null },
  { icon: MessageSquare, label: '내 리뷰',      key: 'reviews',  badge: null },
  { icon: HelpCircle,    label: '문의',          key: 'inquiry',  badge: null },
  { icon: Ticket,        label: '쿠폰 관리',     key: 'coupons',  badge: 1    },
  { icon: Store,         label: '내 상점',       key: 'shop',     badge: null },
  { icon: Settings,      label: '계정 설정',     key: 'settings', badge: null },
]

const ORDER_TABS = ['전체', '결제완료', '배송중', '배송완료', '취소신청']
const ORDER_STATUS_STYLE: Record<string, { label: string; color: string }> = {
  delivered: { label: '배송완료', color: 'var(--color-success)' },
  shipping:  { label: '배송중',   color: '#2196F3' },
  paid:      { label: '결제완료', color: 'var(--color-star)' },
}

const MOCK_ORDERS = [
  { id: 'ORD-20260411', date: '2026.04.11', status: 'delivered', product: MOCK_PRODUCTS[0] },
  { id: 'ORD-20260409', date: '2026.04.09', status: 'shipping',  product: MOCK_PRODUCTS[1] },
  { id: 'ORD-20260407', date: '2026.04.07', status: 'paid',      product: MOCK_PRODUCTS[2] },
]


const MOCK_REVIEWS = [
  {
    id: 1,
    product: MOCK_PRODUCTS[0],
    rating: 5,
    date: '2026.04.11',
    content: '정말 좋은 제품이에요! 보습력이 오래 지속되고 피부가 촉촉해졌어요. 재구매 의사 있습니다.',
    helpful: 12,
    images: [`https://picsum.photos/seed/rev1a/80/80`, `https://picsum.photos/seed/rev1b/80/80`],
  },
  {
    id: 2,
    product: MOCK_PRODUCTS[1],
    rating: 4,
    date: '2026.04.09',
    content: '배송도 빠르고 제품 품질도 만족스럽습니다. 다음에도 구매할 것 같아요.',
    helpful: 5,
    images: [],
  },
  {
    id: 3,
    product: MOCK_PRODUCTS[2],
    rating: 4.5,
    date: '2026.03.28',
    content: '사용감이 좋고 발림성이 뛰어나요. 향도 은은해서 좋아요.',
    helpful: 8,
    images: [`https://picsum.photos/seed/rev3a/80/80`],
  },
]

type InquiryStatus = 'answered' | 'pending'
const MOCK_INQUIRIES: {
  id: number
  product: typeof MOCK_PRODUCTS[0]
  title: string
  date: string
  status: InquiryStatus
  question: string
  answer: string | null
}[] = [
  {
    id: 1,
    product: MOCK_PRODUCTS[3],
    title: '배송 관련 문의',
    date: '2026.04.10',
    status: 'answered',
    question: '주문한 지 3일이 지났는데 아직 배송이 시작되지 않았어요. 언제 출발하나요?',
    answer:
      '안녕하세요! 고객님의 주문은 현재 출고 준비 중입니다. 내일 오전 중 발송될 예정이오니 조금만 기다려 주세요. 감사합니다.',
  },
  {
    id: 2,
    product: MOCK_PRODUCTS[0],
    title: '사이즈 교환 가능한가요?',
    date: '2026.04.08',
    status: 'answered',
    question: 'M 사이즈를 주문했는데 생각보다 작아서 L로 교환하고 싶어요.',
    answer:
      '배송 완료 후 7일 이내에 교환 신청이 가능합니다. 마이페이지 > 주문 내역에서 교환 신청을 진행해 주세요.',
  },
  {
    id: 3,
    product: MOCK_PRODUCTS[4],
    title: '성분 문의',
    date: '2026.04.05',
    status: 'pending',
    question: '알러지가 있는데 특정 성분이 포함되어 있는지 확인하고 싶어요.',
    answer: null,
  },
]

const MOCK_COUPONS = [
  {
    id: 1,
    title: '신규 가입 축하 쿠폰',
    discount: '10%',
    type: 'percent' as const,
    minOrder: 20000,
    expiry: '2026.05.31',
    used: false,
    color: '#7C3AED',
  },
  {
    id: 2,
    title: '생일 특별 할인',
    discount: '5,000원',
    type: 'amount' as const,
    minOrder: 30000,
    expiry: '2026.04.30',
    used: false,
    color: '#FF3D87',
  },
  {
    id: 3,
    title: '리뷰 작성 감사 쿠폰',
    discount: '3,000원',
    type: 'amount' as const,
    minOrder: 15000,
    expiry: '2026.03.31',
    used: true,
    color: '#9E9E9E',
  },
  {
    id: 4,
    title: '뷰티 카테고리 전용',
    discount: '15%',
    type: 'percent' as const,
    minOrder: 50000,
    expiry: '2026.06.30',
    used: false,
    color: '#E65100',
  },
]

// ── 주문 내역 ─────────────────────────────────────────────────
function OrdersSection() {
  const [orderTab, setOrderTab] = useState('전체')
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
      <div className="flex flex-col gap-4">
        {MOCK_ORDERS.map((order) => {
          const statusInfo = ORDER_STATUS_STYLE[order.status]
          return (
            <div
              key={order.id}
              className="border rounded-[8px] p-4"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                >
                  {statusInfo.label}
                </span>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{order.date}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={order.product.image}
                  alt={order.product.name}
                  className="w-12 h-12 rounded-[8px] object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{order.product.name}</p>
                  <p className="text-sm font-bold mt-0.5">{order.product.price.toLocaleString()}원</p>
                </div>
                <button className="text-xs shrink-0" style={{ color: 'var(--color-primary)' }}>
                  주문상세 보기 &gt;
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── 찜한 상품 ─────────────────────────────────────────────────
function WishlistSection() {
  const [products, setProducts] = useState<{ id: number; name: string; price: number; image: string; seller?: { id: number; storeName: string; image: string } }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userApi.getWishProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">찜한 상품</h2>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm py-10 text-center" style={{ color: 'var(--color-text-disabled)' }}>찜한 상품이 없습니다</p>
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

                <div className="flex items-center justify-end pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
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
  const [expanded, setExpanded] = useState<number | null>(null)
  const navigate = useNavigate()

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold mb-1">문의</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            총 {MOCK_INQUIRIES.length}건의 문의
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => navigate('/inquiry')}>문의하기</Button>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_INQUIRIES.map((item) => (
          <div
            key={item.id}
            className="border rounded-[8px] overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {/* 헤더 */}
            <button
              className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-black/[0.02]"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-10 h-10 rounded-[6px] object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                    style={
                      item.status === 'answered'
                        ? { background: 'rgba(46,125,50,0.1)', color: 'var(--color-success)' }
                        : { background: 'rgba(255,61,135,0.1)', color: 'var(--color-primary)' }
                    }
                  >
                    {item.status === 'answered' ? '답변완료' : '답변대기'}
                  </span>
                  <span className="text-sm font-medium truncate">{item.title}</span>
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.product.name}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.date}
                </span>
                {expanded === item.id ? (
                  <ChevronUp size={16} style={{ color: 'var(--color-text-secondary)' }} />
                ) : (
                  <ChevronDown size={16} style={{ color: 'var(--color-text-secondary)' }} />
                )}
              </div>
            </button>

            {/* 상세 내용 */}
            {expanded === item.id && (
              <div
                className="border-t px-4 pb-4 flex flex-col gap-3"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {/* 질문 */}
                <div className="pt-3">
                  <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Q. 문의 내용
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                    {item.question}
                  </p>
                </div>
                {/* 답변 */}
                {item.answer ? (
                  <div
                    className="rounded-[8px] p-3"
                    style={{ background: 'var(--color-surface)' }}
                  >
                    <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-primary)' }}>
                      A. 판매자 답변
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                      {item.answer}
                    </p>
                  </div>
                ) : (
                  <div
                    className="rounded-[8px] p-3 text-center"
                    style={{ background: 'var(--color-surface)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      답변을 준비 중입니다. 조금만 기다려 주세요.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── 쿠폰 관리 ─────────────────────────────────────────────────
function CouponsSection() {
  const [tab, setTab] = useState<'available' | 'used'>('available')

  const available = MOCK_COUPONS.filter((c) => !c.used)
  const used = MOCK_COUPONS.filter((c) => c.used)
  const list = tab === 'available' ? available : used

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">쿠폰 관리</h2>

      {/* 탭 */}
      <div className="flex gap-4 border-b mb-5" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { key: 'available' as const, label: `사용 가능 (${available.length})` },
          { key: 'used' as const,      label: `사용 완료 (${used.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
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

      {/* 쿠폰 입력 */}
      {tab === 'available' && (
        <div className="flex gap-2 mb-5">
          <input
            type="text"
            placeholder="쿠폰 코드를 입력하세요"
            className="flex-1 h-10 px-3 text-sm border-2 rounded-xl outline-none transition-all focus:border-[#FF3D87]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
          <Button size="sm">등록</Button>
        </div>
      )}

      {/* 쿠폰 목록 */}
      <div className="flex flex-col gap-3">
        {list.map((coupon) => (
          <div
            key={coupon.id}
            className="flex overflow-hidden rounded-[8px] border"
            style={{
              borderColor: coupon.used ? 'var(--color-border)' : coupon.color + '40',
              opacity: coupon.used ? 0.6 : 1,
            }}
          >
            {/* 왼쪽 색상 띠 */}
            <div
              className="w-2 shrink-0"
              style={{ background: coupon.used ? 'var(--color-border)' : coupon.color }}
            />
            {/* 내용 */}
            <div className="flex-1 flex items-center justify-between px-4 py-3 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {coupon.title}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {coupon.minOrder.toLocaleString()}원 이상 구매 시 사용 가능
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  만료일: {coupon.expiry}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="text-xl font-bold"
                  style={{ color: coupon.used ? 'var(--color-text-disabled)' : coupon.color }}
                >
                  {coupon.discount}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: coupon.used ? 'var(--color-text-disabled)' : coupon.color }}
                >
                  {coupon.type === 'percent' ? '할인' : '할인쿠폰'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── 계정 설정 ─────────────────────────────────────────────────
function SettingsSection() {
  const { user, refreshUser } = useAuth()

  const [nickname, setNickname] = useState('')
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

  const passwordStrength =
    newPassword.length === 0 ? 0
    : newPassword.length < 6 ? 1
    : newPassword.length < 10 ? 2
    : 3
  const strengthLabel = ['', '약함', '보통', '강함'][passwordStrength]
  const strengthColor = ['', 'var(--color-error)', 'var(--color-star)', 'var(--color-success)'][passwordStrength]

  // 프로필 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfile()
        setNickname(res.data.nickname)
      } catch {
        // 이미 AuthContext에 user가 있으면 그걸 사용
        if (user) setNickname(user.nickname)
      } finally {
        setProfileLoading(false)
      }
    }
    fetchProfile()
  }, [user])

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
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                {user?.nickname?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-text-primary)' }}
              >
                <Camera size={12} color="#fff" />
              </button>
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
  const { user } = useAuth()
  const navigate = useNavigate()

  const [shop, setShop] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // 폼 상태
  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')

  // 내 상점 조회: GET /users/sellers
  useEffect(() => {
    if (!user) { setLoading(false); return }
    userApi.getMySeller()
      .then((res) => {
        setShop(res.data)
        setStoreName(res.data.storeName)
        setDescription(res.data.description)
      })
      .catch(() => { /* 상점 없음 */ })
      .finally(() => setLoading(false))
  }, [user])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body: CreateSellerBody = { storeName, description }
      const res = await sellersApi.create(body)
      setShop(res.data)
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
      const res = await sellersApi.update(shop.id, { storeName, description })
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
      setConfirmDelete(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '상점 삭제 중 오류가 발생했습니다')
    } finally {
      setDeleting(false)
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
        // 상점이 있는 경우 - 수정 폼
        <div className="flex flex-col gap-6">
          {/* 상점 미리보기 링크 */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl border"
            style={{ borderColor: 'var(--color-border)', background: '#FAFAFA' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-primary)' }}
            >
              <Store size={20} color="#fff" />
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

          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
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

          {/* 삭제 */}
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
  const [activeMenu, setActiveMenu] = useState('orders')

  const renderContent = () => {
    switch (activeMenu) {
      case 'orders':   return <OrdersSection />
      case 'wishlist': return <WishlistSection />
      case 'reviews':  return <ReviewsSection />
      case 'inquiry':  return <InquirySection />
      case 'coupons':  return <CouponsSection />
      case 'shop':     return <ShopSection />
      case 'settings': return <SettingsSection />
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
              U
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">닉네임</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                user@example.com
              </p>
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

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import type { CartItem } from '../api/cart'
import { ordersApi } from '../api/orders'
import { couponsApi, type UserCoupon } from '../api/coupons'
import { paymentsApi } from '../api/payments'
import { ApiError } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { loadTossPayments } from '@tosspayments/tosspayments-js'

const STEPS = ['장바구니 확인', '주문 정보 입력', '결제']
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY as string

interface CheckoutItem extends CartItem {
  checked?: boolean
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user }  = useAuth()
  const items: CheckoutItem[] = (location.state as { items: CheckoutItem[] } | null)?.items ?? []

  const [payMethod, setPayMethod] = useState('카드')
  const [agreed, setAgreed]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const [recipient, setRecipient]         = useState('')
  const [phone, setPhone]                 = useState('')
  const [address, setAddress]             = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [memo, setMemo]                   = useState('')

  // 쿠폰
  const [coupons, setCoupons]         = useState<UserCoupon[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null)
  const [couponOpen, setCouponOpen]   = useState(false)

  useEffect(() => {
    if (!user) return
    couponsApi.getMyCoupons()
      .then((res) => setCoupons((res.data ?? []).filter((c) => !c.used)))
      .catch(() => setCoupons([]))
  }, [user])

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0)

  const discount = selectedCoupon
    ? selectedCoupon.discountType === 'RATE'
      ? subtotal >= selectedCoupon.minOrderPrice
        ? Math.floor(subtotal * selectedCoupon.discountValue / 100)
        : 0
      : subtotal >= selectedCoupon.minOrderPrice
        ? selectedCoupon.discountValue
        : 0
    : 0

  const finalTotal = subtotal - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fullAddress = [recipient, phone, address, addressDetail, memo]
        .filter(Boolean)
        .join(' / ')
      const orderRes = await ordersApi.create({
        address: fullAddress,
        orderItems: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        ...(selectedCoupon ? { couponId: selectedCoupon.userCouponId } : {}),
      })

      const readyRes = await paymentsApi.ready(orderRes.data.orderId)
      const { tossOrderId, orderName, amount } = readyRes.data

      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY)
      const payment = tossPayments.payment({
        customerKey: user?.id ? String(user.id) : 'ANONYMOUS',
      })
      await payment.requestPayment({
        method: payMethod === '카드' ? 'CARD'
          : payMethod === '가상계좌' ? 'VIRTUAL_ACCOUNT'
          : payMethod === '계좌이체' ? 'TRANSFER'
          : 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId: tossOrderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error && err.message !== 'PAY_PROCESS_CANCELED') {
        setError('결제 처리 중 오류가 발생했습니다')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={
                  i === 1
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : i < 1
                    ? { background: 'var(--color-primary)', color: '#fff', opacity: 0.5 }
                    : { background: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                }
              >
                {i + 1}
              </div>
              <span
                className="text-xs whitespace-nowrap"
                style={{
                  color: i === 1 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: i === 1 ? 600 : 400,
                }}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-20 h-0.5 mb-5"
                style={{ background: i < 1 ? 'var(--color-primary)' : 'var(--color-border)' }} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-8">
            {/* 주문 상품 */}
            {items.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-4">주문 상품 ({items.length}개)</h2>
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-[8px]"
                      style={{ background: 'var(--color-surface)' }}>
                      <div className="w-12 h-12 rounded-[6px] shrink-0" style={{ background: 'var(--color-border)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                          {item.pricePerItem.toLocaleString()}원 × {item.quantity}개
                        </p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">{item.totalPrice.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 배송지 */}
            <section>
              <h2 className="text-base font-semibold mb-4">배송지 정보</h2>
              <div className="flex flex-col gap-4">
                <Input label="받는 분" placeholder="이름 입력" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
                <Input label="연락처" type="tel" placeholder="010-1234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <Input label="주소" placeholder="주소 검색" value={address} onChange={(e) => setAddress(e.target.value)} required />
                <Input label="상세 주소" placeholder="상세 주소 입력" value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} />
                <Input label="배송 메모" placeholder="배송 메모 (선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />
              </div>
            </section>

            {/* 쿠폰 */}
            <section>
              <h2 className="text-base font-semibold mb-4">쿠폰 적용</h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCouponOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-[8px] border text-sm transition-colors"
                  style={{ borderColor: 'var(--color-border)', color: selectedCoupon ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  <span className="flex items-center gap-2">
                    <Ticket size={15} />
                    {selectedCoupon
                      ? selectedCoupon.discountType === 'RATE'
                        ? `${selectedCoupon.discountValue}% 할인 쿠폰`
                        : `${selectedCoupon.discountValue.toLocaleString()}원 할인 쿠폰`
                      : coupons.length > 0 ? `쿠폰 ${coupons.length}개 보유` : '사용 가능한 쿠폰이 없습니다'}
                  </span>
                  {selectedCoupon && (
                    <span
                      className="text-xs"
                      style={{ color: 'var(--color-primary)' }}
                      onClick={(e) => { e.stopPropagation(); setSelectedCoupon(null) }}
                    >
                      해제
                    </span>
                  )}
                </button>

                {couponOpen && coupons.length > 0 && (
                  <div
                    className="absolute top-[calc(100%+4px)] left-0 w-full rounded-[8px] border overflow-hidden z-10"
                    style={{ borderColor: 'var(--color-border)', background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  >
                    {coupons.map((c) => {
                      const applicable = subtotal >= c.minOrderPrice
                      return (
                        <button
                          key={c.userCouponId}
                          type="button"
                          disabled={!applicable}
                          onClick={() => { setSelectedCoupon(c); setCouponOpen(false) }}
                          className="w-full text-left px-4 py-3 text-sm border-b last:border-b-0 transition-colors hover:bg-[#F7F7F7] disabled:opacity-40"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <p className="font-medium">
                            {c.discountType === 'RATE' ? `${c.discountValue}% 할인` : `${c.discountValue.toLocaleString()}원 할인`}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                            {c.minOrderPrice > 0 && `${c.minOrderPrice.toLocaleString()}원 이상 구매 시 · `}
                            {!applicable && '금액 미달'}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* 결제 수단 */}
            <section>
              <h2 className="text-base font-semibold mb-4">결제 수단</h2>
              <div className="flex gap-2">
                {['카드', '가상계좌', '계좌이체'].map((m) => (
                  <button key={m} type="button" onClick={() => setPayMethod(m)}
                    className="px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors"
                    style={m === payMethod
                      ? { background: 'var(--color-text-primary)', color: '#fff', borderColor: 'var(--color-text-primary)' }
                      : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>
                    {m}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                결제 버튼 클릭 시 토스페이먼츠 결제창이 열립니다
              </p>
            </section>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={() => setAgreed((v) => !v)}
                className="w-4 h-4 accent-[var(--color-primary)]" />
              주문 내용을 확인하고 결제에 동의합니다
            </label>

            {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}
          </div>

          {/* 주문 요약 */}
          <div className="lg:w-72 shrink-0">
            <div className="sticky top-[72px] rounded-[8px] border p-6 flex flex-col gap-3"
              style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-base font-semibold mb-1">주문 요약</h2>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>상품 금액</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-secondary)' }}>쿠폰 할인</span>
                  <span style={{ color: 'var(--color-primary)' }}>-{discount.toLocaleString()}원</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>배송비</span>
                <span style={{ color: 'var(--color-success)' }}>무료</span>
              </div>
              <div className="flex justify-between pt-3 border-t font-bold"
                style={{ borderColor: 'var(--color-border)' }}>
                <span>최종 결제금액</span>
                <span className="text-xl">{finalTotal.toLocaleString()}원</span>
              </div>
              <Button type="submit" size="full" disabled={!agreed || items.length === 0 || loading} className="mt-2 text-base">
                {loading ? '처리 중...' : `${finalTotal.toLocaleString()}원 결제하기`}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

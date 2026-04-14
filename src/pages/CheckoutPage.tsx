import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const STEPS = ['장바구니 확인', '주문 정보 입력', '주문 완료']
const PAYMENT_METHODS = ['신용카드', '가상계좌', '포스페이', '무통장입금']

export default function CheckoutPage() {
  const [payMethod, setPayMethod] = useState('신용카드')
  const [agreed, setAgreed] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/')
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
              <div
                className="w-20 h-0.5 mb-5"
                style={{ background: i < 1 ? 'var(--color-primary)' : 'var(--color-border)' }}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Shipping */}
            <section>
              <h2 className="text-base font-semibold mb-4">배송지 정보</h2>
              <div className="flex flex-col gap-4">
                <Input label="받는 분" placeholder="이름 입력" required />
                <Input label="연락처" type="tel" placeholder="010-1234-5678" required />
                <Input label="주소" placeholder="주소 검색" required />
                <Input label="상세 주소" placeholder="상세 주소 입력" />
                <Input label="배송 메모" placeholder="배송 메모 (선택)" />
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="text-base font-semibold mb-4">결제 수단</h2>
              <div className="flex gap-2 mb-4">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayMethod(m)}
                    className="px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors"
                    style={
                      m === payMethod
                        ? { background: 'var(--color-text-primary)', color: '#fff', borderColor: 'var(--color-text-primary)' }
                        : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>
              {payMethod === '신용카드' && (
                <div className="flex flex-col gap-4">
                  <Input label="카드 번호" placeholder="1234-5678-9012-3456" />
                  <div className="flex gap-4">
                    <Input label="유효기간" placeholder="MM/YY" />
                    <Input label="CVC" placeholder="123" />
                  </div>
                </div>
              )}
            </section>

            {/* Agreement */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed((v) => !v)}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
              주문 내용을 확인하고 결제에 동의합니다
            </label>
          </div>

          {/* Order summary */}
          <div className="lg:w-72 shrink-0">
            <div
              className="sticky top-[72px] rounded-[8px] border p-6 flex flex-col gap-3"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-base font-semibold mb-1">주문 요약</h2>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>상품 금액</span>
                <span>65,900원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>할인 금액</span>
                <span style={{ color: 'var(--color-primary)' }}>-6,590원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>배송비</span>
                <span style={{ color: 'var(--color-success)' }}>무료</span>
              </div>
              <div
                className="flex justify-between pt-3 border-t font-bold"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span>최종 결제금액</span>
                <span className="text-xl">59,310원</span>
              </div>
              <Button type="submit" size="full" disabled={!agreed} className="mt-2 text-base">
                59,310원 결제하기
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

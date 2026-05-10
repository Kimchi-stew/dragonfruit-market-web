import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import { paymentsApi, type TossPaymentResponse } from '../api/payments'
import { ApiError } from '../api/client'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const handled = useRef(false)
  const [result, setResult]   = useState<TossPaymentResponse | null>(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params     = new URLSearchParams(window.location.search)
    const paymentKey = params.get('paymentKey') ?? ''
    const orderId    = params.get('orderId') ?? ''
    const amount     = Number(params.get('amount') ?? '0')

    if (!paymentKey || !orderId || !amount) {
      setError('잘못된 결제 정보입니다')
      setLoading(false)
      return
    }

    paymentsApi.confirm(paymentKey, orderId, amount)
      .then((res) => setResult(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : '결제 확인 중 오류가 발생했습니다'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[500px] mx-auto px-6 py-20 flex flex-col items-center gap-6 text-center">
        <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
        <Button onClick={() => navigate('/')}>홈으로</Button>
      </div>
    )
  }

  return (
    <div className="max-w-[500px] mx-auto px-6 py-20 flex flex-col items-center gap-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(76,175,80,0.1)' }}
      >
        <CheckCircle size={40} style={{ color: 'var(--color-success)' }} />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">결제가 완료되었습니다!</h2>
        {result && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            주문명: <strong>{result.orderName}</strong><br />
            결제 금액: <strong>{result.totalAmount.toLocaleString()}원</strong><br />
            결제 수단: <strong>{result.method}</strong>
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => navigate('/mypage')}>주문 내역 보기</Button>
        <Button onClick={() => navigate('/')}>홈으로</Button>
      </div>
    </div>
  )
}

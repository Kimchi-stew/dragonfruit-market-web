import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import { paymentsApi } from '../api/payments'

export default function PaymentFailPage() {
  const navigate = useNavigate()
  const params   = new URLSearchParams(window.location.search)
  const message  = params.get('message') ?? '결제가 취소되었습니다'
  const code     = params.get('code') ?? ''
  const orderId  = Number(params.get('orderId') ?? '0')
  const handled  = useRef(false)

  useEffect(() => {
    if (handled.current || !orderId) return
    handled.current = true
    paymentsApi.fail(orderId, code, message).catch(() => {})
  }, [orderId, code, message])

  return (
    <div className="max-w-[500px] mx-auto px-6 py-20 flex flex-col items-center gap-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(244,67,54,0.1)' }}
      >
        <XCircle size={40} style={{ color: 'var(--color-error)' }} />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">결제에 실패했습니다</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {message}
          {code && <span className="block text-xs mt-1 opacity-60">({code})</span>}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => navigate(-1 as never)}>다시 시도</Button>
        <Button onClick={() => navigate('/')}>홈으로</Button>
      </div>
    </div>
  )
}

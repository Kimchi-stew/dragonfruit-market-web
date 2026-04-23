import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingCart } from 'lucide-react'
import Button from '../components/ui/Button'
import { cartApi, type CartItem, type Cart } from '../api/cart'

interface CartItemState extends CartItem {
  checked: boolean
}

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart | null>(null)
  const [items, setItems] = useState<CartItemState[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await cartApi.get()
        setCart(res.data)
        setItems(res.data.items.map((item) => ({ ...item, checked: true })))
      } catch {
        setCart(null)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [])

  const allChecked = items.length > 0 && items.every((i) => i.checked)
  const toggleAll = () => {
    const next = !allChecked
    setItems((prev) => prev.map((i) => ({ ...i, checked: next })))
  }
  const toggle = (id: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
  }

  const remove = async (item: CartItemState) => {
    setRemoving(item.id)
    try {
      await cartApi.remove(item.productId, item.quantity)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch {
      // 실패해도 낙관적 업데이트 유지 안 함
    } finally {
      setRemoving(null)
    }
  }

  const checkedItems = items.filter((i) => i.checked)
  const subtotal = checkedItems.reduce((sum, i) => sum + i.totalPrice, 0)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!cart || items.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col items-center gap-4">
        <ShoppingCart size={64} style={{ color: 'var(--color-text-disabled)' }} />
        <p className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          장바구니가 비어있어요
        </p>
        <Link to="/products">
          <Button>쇼핑하러 가기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <h1 className="text-xl font-bold mb-6">장바구니 [{items.length}개]</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart items */}
        <div className="flex-1">
          <div className="flex items-center gap-2 pb-3 border-b mb-4" style={{ borderColor: 'var(--color-border)' }}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll}
              className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer" />
            <span className="text-sm font-medium">
              전체선택 ({checkedItems.length}/{items.length})
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-4 rounded-[8px]"
                style={{ background: 'var(--color-surface)' }}>
                <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)}
                  className="w-4 h-4 mt-1 accent-[var(--color-primary)] cursor-pointer shrink-0" />

                <div className="w-16 h-16 rounded-[8px] shrink-0 flex items-center justify-center"
                  style={{ background: 'var(--color-border)' }}>
                  <ShoppingCart size={20} style={{ color: 'var(--color-text-disabled)' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productName}</p>
                  <p className="text-sm font-bold mt-1">
                    {item.pricePerItem.toLocaleString()}원
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    수량: {item.quantity}개 · 합계 {item.totalPrice.toLocaleString()}원
                  </p>
                </div>

                <button
                  onClick={() => remove(item)}
                  disabled={removing === item.id}
                  className="shrink-0 transition-opacity disabled:opacity-40"
                >
                  <X size={18} style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:w-72 shrink-0">
          <div className="sticky top-[72px] rounded-[8px] border p-6 flex flex-col gap-3"
            style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-base font-semibold mb-1">주문 요약</h2>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>상품 금액</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>배송비</span>
              <span style={{ color: 'var(--color-success)' }}>무료</span>
            </div>
            <div className="flex justify-between pt-3 border-t font-bold" style={{ borderColor: 'var(--color-border)' }}>
              <span>최종 결제금액</span>
              <span className="text-xl">{subtotal.toLocaleString()}원</span>
            </div>
            <Button
              size="full"
              className="mt-2"
              disabled={checkedItems.length === 0}
              onClick={() => navigate('/checkout', { state: { items: checkedItems } })}
            >
              주문하기 ({checkedItems.length}개)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

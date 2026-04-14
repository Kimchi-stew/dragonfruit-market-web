import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingCart } from 'lucide-react'
import Button from '../components/ui/Button'
import { MOCK_PRODUCTS } from '../data/mockProducts'

interface CartItem {
  id: number
  product: (typeof MOCK_PRODUCTS)[0]
  quantity: number
  checked: boolean
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(
    MOCK_PRODUCTS.slice(0, 3).map((p, i) => ({ id: i, product: p, quantity: 1, checked: true }))
  )

  const allChecked = items.every((i) => i.checked)

  const toggleAll = () => {
    const next = !allChecked
    setItems((prev) => prev.map((i) => ({ ...i, checked: next })))
  }

  const toggle = (id: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
  }

  const setQty = (id: number, qty: number) => {
    if (qty < 1) return
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)))
  }

  const remove = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const checkedItems = items.filter((i) => i.checked)
  const subtotal = checkedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const discount = checkedItems.reduce((sum, i) => {
    const orig = i.product.originalPrice ?? i.product.price
    return sum + (orig - i.product.price) * i.quantity
  }, 0)
  const total = subtotal

  if (items.length === 0) {
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
          {/* Select all */}
          <div
            className="flex items-center gap-2 pb-3 border-b mb-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
            />
            <span className="text-sm font-medium">
              전체선택 ({checkedItems.length}/{items.length})
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-4 rounded-[8px]"
                style={{ background: 'var(--color-surface)' }}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggle(item.id)}
                  className="w-4 h-4 mt-1 accent-[var(--color-primary)] cursor-pointer shrink-0"
                />
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-[8px] object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.product.brand}
                  </p>
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-sm font-bold mt-1">
                    {item.product.price.toLocaleString()}원
                  </p>
                  {/* Quantity stepper */}
                  <div
                    className="flex items-center border rounded-[8px] w-fit mt-2"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <button className="w-8 h-8 text-lg" onClick={() => setQty(item.id, item.quantity - 1)}>
                      -
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button className="w-8 h-8 text-lg" onClick={() => setQty(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <button onClick={() => remove(item.id)} className="shrink-0">
                  <X size={18} style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              </div>
            ))}
          </div>
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
              <span>{subtotal.toLocaleString()}원</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>할인 금액</span>
                <span style={{ color: 'var(--color-primary)' }}>-{discount.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>배송비</span>
              <span style={{ color: 'var(--color-success)' }}>무료</span>
            </div>
            <div
              className="flex justify-between pt-3 border-t font-bold"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span>최종 결제금액</span>
              <span className="text-xl">{total.toLocaleString()}원</span>
            </div>
            <Link to="/checkout">
              <Button size="full" className="mt-2">
                주문하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

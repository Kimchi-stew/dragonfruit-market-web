import { useState } from 'react'
import { Package, Heart, ThumbsUp, MessageSquare, HelpCircle, Ticket, Settings } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { MOCK_PRODUCTS } from '../data/mockProducts'

const SIDEBAR_MENU = [
  { icon: Package, label: '주문 내역', key: 'orders', badge: null },
  { icon: Heart, label: '찜한 상품', key: 'wishlist', badge: null },
  { icon: ThumbsUp, label: '좋아요한 상품', key: 'liked', badge: null },
  { icon: MessageSquare, label: '내 리뷰', key: 'reviews', badge: null },
  { icon: HelpCircle, label: '문의', key: 'inquiry', badge: null },
  { icon: Ticket, label: '쿠폰 관리', key: 'coupons', badge: 1 },
  { icon: Settings, label: '계정 설정', key: 'settings', badge: null },
]

const ORDER_TABS = ['전체', '결제완료', '배송중', '배송완료', '취소신청']
const ORDER_STATUS_STYLE: Record<string, { label: string; color: string }> = {
  delivered: { label: '배송완료', color: 'var(--color-success)' },
  shipping: { label: '배송중', color: '#2196F3' },
  paid: { label: '결제완료', color: 'var(--color-star)' },
}

const MOCK_ORDERS = [
  { id: 'ORD-20260411', date: '2026.04.11', status: 'delivered', product: MOCK_PRODUCTS[0] },
  { id: 'ORD-20260409', date: '2026.04.09', status: 'shipping', product: MOCK_PRODUCTS[1] },
  { id: 'ORD-20260407', date: '2026.04.07', status: 'paid', product: MOCK_PRODUCTS[2] },
]

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState('orders')
  const [orderTab, setOrderTab] = useState('전체')

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-[200px] shrink-0 hidden md:block">
          {/* Profile */}
          <div className="flex flex-col items-center gap-2 pb-5 border-b mb-4" style={{ borderColor: 'var(--color-border)' }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              U
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">닉네임</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>user@example.com</p>
            </div>
            <button className="text-xs" style={{ color: 'var(--color-primary)' }}>프로필 편집</button>
          </div>

          {/* Menu */}
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

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeMenu === 'orders' && (
            <section>
              <h2 className="text-lg font-semibold mb-4">주문 내역</h2>
              {/* Tabs */}
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
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {order.date}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {order.id}
                          </p>
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
          )}

          {activeMenu === 'wishlist' && (
            <section>
              <h2 className="text-lg font-semibold mb-4">찜한 상품</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MOCK_PRODUCTS.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} size="small" />
                ))}
              </div>
            </section>
          )}

          {activeMenu !== 'orders' && activeMenu !== 'wishlist' && (
            <div className="flex items-center justify-center h-48" style={{ color: 'var(--color-text-secondary)' }}>
              준비 중인 페이지입니다
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

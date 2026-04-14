import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, Truck } from 'lucide-react'
import Button from '../components/ui/Button'
import StarRating from '../components/ui/StarRating'
import Breadcrumb from '../components/ui/Breadcrumb'
import { MOCK_PRODUCTS } from '../data/mockProducts'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const COLORS = ['#FFFFFF', '#1A1A1A', '#9E9E9E']

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = MOCK_PRODUCTS.find((p) => p.id === Number(id)) ?? MOCK_PRODUCTS[0]

  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('#1A1A1A')
  const [quantity, setQuantity] = useState(1)
  const [wished, setWished] = useState(false)
  const [mainImg, setMainImg] = useState(0)
  const [reviewTab, setReviewTab] = useState('전체리뷰')

  const thumbs = [0, 1, 2, 3].map((i) =>
    `https://picsum.photos/seed/prod${product.id}_${i}/400/400`
  )

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <Breadcrumb
        items={[{ label: '홈', to: '/' }, { label: '상품 목록', to: '/products' }, { label: product.name }]}
      />

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-10 mt-6">
        {/* Left: Images */}
        <div className="flex flex-col gap-3 md:w-[500px] shrink-0">
          <div className="rounded-[8px] overflow-hidden" style={{ aspectRatio: '1/1' }}>
            <img
              src={`https://picsum.photos/seed/prod${product.id}_${mainImg}/600/600`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            {thumbs.map((src, i) => (
              <button
                key={i}
                onClick={() => setMainImg(i)}
                className="w-20 h-20 rounded-[8px] overflow-hidden border-2 transition-colors"
                style={{ borderColor: mainImg === i ? 'var(--color-primary)' : 'transparent' }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-4 flex-1">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {product.brand}
          </p>
          <h1 className="text-[22px] font-bold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
            {product.name}
          </h1>
          <StarRating rating={product.rating} count={product.reviewCount} size="md" />

          {/* Satisfaction bars */}
          <div className="flex flex-col gap-2 p-4 rounded-[8px]" style={{ background: 'var(--color-surface)' }}>
            {[{ label: '배송 만족도', value: 92 }, { label: '품질 만족도', value: 88 }].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.label}
                </span>
                <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.value}%`, background: 'var(--color-primary)' }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            {product.originalPrice && (
              <span className="text-base line-through" style={{ color: 'var(--color-text-secondary)' }}>
                {product.originalPrice.toLocaleString()}원
              </span>
            )}
            <span className="text-[28px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {product.price.toLocaleString()}원
            </span>
            {product.discountRate && (
              <span
                className="text-sm font-bold text-white px-2 py-0.5 rounded-[4px]"
                style={{ background: 'var(--color-primary)' }}
              >
                -{product.discountRate}% OFF
              </span>
            )}
          </div>

          {/* Size */}
          <div>
            <p className="text-sm font-medium mb-2">사이즈</p>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className="w-12 h-9 text-sm font-medium border rounded-[4px] transition-colors"
                  style={
                    s === selectedSize
                      ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                      : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <p className="text-sm font-medium mb-2">색상</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{
                    background: c,
                    borderColor: selectedColor === c ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium mb-2">수량</p>
            <div
              className="flex items-center border rounded-[8px] w-fit"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                className="w-10 h-10 text-lg"
                onClick={() => setQuantity((v) => Math.max(1, v - 1))}
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                className="w-10 h-10 text-lg"
                onClick={() => setQuantity((v) => v + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <Button variant="secondary" size="full">
              장바구니 담기
            </Button>
            <Button size="full">바로 구매하기</Button>
            <button
              onClick={() => setWished((v) => !v)}
              className="w-12 h-12 shrink-0 flex items-center justify-center border rounded-full"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Heart
                size={20}
                fill={wished ? 'var(--color-primary)' : 'none'}
                stroke={wished ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
              />
            </button>
          </div>

          {/* Delivery */}
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <Truck size={16} />
            무료배송 (5만원 이상)
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className="text-lg font-semibold mb-4">
          리뷰 ({product.reviewCount.toLocaleString()}개)
        </h2>

        {/* Tabs */}
        <div className="flex gap-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {['전체리뷰', '포토리뷰', '평점높은순', '최신순'].map((tab) => (
            <button
              key={tab}
              onClick={() => setReviewTab(tab)}
              className="pb-3 text-sm font-medium border-b-2 transition-colors"
              style={
                tab === reviewTab
                  ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                  : { borderColor: 'transparent', color: 'var(--color-text-secondary)' }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Rating summary */}
        <div className="flex gap-8 py-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-[40px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {product.rating.toFixed(1)}
            </span>
            <StarRating rating={product.rating} size="lg" showCount={false} />
          </div>
          <div className="flex flex-col gap-2 flex-1 max-w-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = star === 5 ? 60 : star === 4 ? 25 : star === 3 ? 10 : star === 2 ? 3 : 2
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs w-4 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                    {star}
                  </span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: 'var(--color-primary)' }}
                    />
                  </div>
                  <span className="text-xs w-8" style={{ color: 'var(--color-text-secondary)' }}>
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Review list */}
        <div className="flex flex-col divide-y" style={{ '--tw-divide-color': 'var(--color-border)' } as React.CSSProperties}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-5 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {String.fromCharCode(64 + i)}
                </div>
                <div>
                  <p className="text-sm font-medium">사용자{i}***</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    2026.04.{10 + i}
                  </p>
                </div>
              </div>
              <StarRating rating={5 - i * 0.5} size="sm" showCount={false} />
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                정말 좋은 상품입니다. 배송도 빠르고 품질도 만족스러워요. 재구매 의사 있습니다!
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

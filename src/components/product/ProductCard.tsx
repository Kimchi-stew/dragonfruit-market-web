import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import StarRating from '../ui/StarRating'

export interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice?: number
  discountRate?: number
  rating: number
  reviewCount: number
  image: string
  category: string                          // beauty | fashion | food | tool | sports | pet
  subcategory: string                       // 서브카테고리 칩과 일치
  attrs: Record<string, string | string[]>  // 필터 속성
}

interface ProductCardProps {
  product: Product
  size?: 'default' | 'small'
}

// 이미지 로딩 전 placeholder 색상
const PLACEHOLDER_COLORS = [
  '#F3EEFF', '#EFF4FF', '#EDFFF7', '#FFF8ED',
  '#FFE9F3', '#F0F0F0', '#EDF6FF', '#FFF3F3',
]

const ProductCard = memo(function ProductCard({ product, size = 'default' }: ProductCardProps) {
  const [wished, setWished] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault()
    setWished((v) => !v)
    setAnimate(true)
    setTimeout(() => setAnimate(false), 300)
  }

  const isSmall = size === 'small'
  const placeholderBg = PLACEHOLDER_COLORS[(product.id - 1) % PLACEHOLDER_COLORS.length]

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.98] bg-white border border-transparent hover:border-black/5"
      style={{
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '1/1', background: placeholderBg }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s, transform 0.3s' }}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />

        {/* Discount badge */}
        {product.discountRate && (
          <span
            className="absolute top-2 left-2 text-[11px] font-bold text-white px-1.5 py-0.5 rounded-[4px]"
            style={{ background: 'var(--color-primary)' }}
          >
            -{product.discountRate}%
          </span>
        )}

        {/* Wish button */}
        <button
          onClick={handleWish}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm transition-all"
          style={{
            transform: animate ? 'scale(1.3)' : 'scale(1)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        >
          <Heart
            size={isSmall ? 13 : 16}
            fill={wished ? 'var(--color-primary)' : 'none'}
            stroke={wished ? 'var(--color-primary)' : '#BDBDBD'}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Info */}
      <div className={`flex flex-col ${isSmall ? 'gap-0.5 p-2.5' : 'gap-1 p-3'}`}>
        {/* Brand */}
        <p
          className="text-[11px] font-medium truncate"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {product.brand}
        </p>

        {/* Name */}
        <p
          className={`font-medium leading-snug line-clamp-2 ${isSmall ? 'text-xs' : 'text-sm'}`}
          style={{ color: 'var(--color-text-primary)' }}
        >
          {product.name}
        </p>

        {/* Price */}
        <div className={`flex items-center gap-1.5 ${isSmall ? 'mt-0.5' : 'mt-1'}`}>
          {product.discountRate && (
            <span
              className="text-xs font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              {product.discountRate}%
            </span>
          )}
          <span
            className={`font-bold ${isSmall ? 'text-sm' : 'text-[15px]'}`}
            style={{ color: 'var(--color-text-primary)' }}
          >
            {product.price.toLocaleString()}원
          </span>
          {product.originalPrice && (
            <span
              className="text-[11px] line-through"
              style={{ color: 'var(--color-text-disabled)' }}
            >
              {product.originalPrice.toLocaleString()}원
            </span>
          )}
        </div>

        {/* Stars */}
        {!isSmall && (
          <div className="mt-0.5">
            <StarRating rating={product.rating} count={product.reviewCount} size="sm" />
          </div>
        )}
      </div>
    </Link>
  )
})

export default ProductCard

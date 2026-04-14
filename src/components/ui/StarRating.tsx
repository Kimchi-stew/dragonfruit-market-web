interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

const sizeMap = { sm: 11, md: 15, lg: 22 }

export default function StarRating({ rating, count, size = 'md', showCount = true }: StarRatingProps) {
  const px = sizeMap[size]
  const filled = Math.round(rating)

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-px">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill={i <= filled ? 'var(--color-star)' : '#E0E0E0'}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span
        className="font-semibold"
        style={{ fontSize: px + 1, color: 'var(--color-text-primary)', lineHeight: 1 }}
      >
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span style={{ fontSize: px - 1, color: 'var(--color-text-secondary)', lineHeight: 1 }}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  )
}

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ current, total, onChange }: PaginationProps) {
  const pages = Array.from({ length: total }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        className="w-9 h-9 flex items-center justify-center rounded transition-colors disabled:opacity-30"
        style={{ color: 'var(--color-text-secondary)' }}
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className="w-9 h-9 flex items-center justify-center rounded text-sm font-medium transition-colors"
          style={
            p === current
              ? { background: 'var(--color-primary)', color: '#fff' }
              : { color: 'var(--color-text-secondary)' }
          }
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="w-9 h-9 flex items-center justify-center rounded transition-colors disabled:opacity-30"
        style={{ color: 'var(--color-text-secondary)' }}
        onClick={() => onChange(current + 1)}
        disabled={current === total}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

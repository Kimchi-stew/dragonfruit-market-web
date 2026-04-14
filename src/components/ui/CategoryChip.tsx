import type { ReactNode } from 'react'

interface CategoryChipProps {
  label: string
  icon: ReactNode
  color: string
  iconColor?: string
  active?: boolean
  onClick?: () => void
}

export default function CategoryChip({ label, icon, color, iconColor, active, onClick }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col justify-between px-4 pt-4 pb-3 rounded-2xl cursor-pointer transition-all duration-300 ease-out text-left hover:scale-105 hover:shadow-md active:scale-95"
      style={{
        background: color,
        minHeight: 96,
        outline: active ? '2px solid var(--color-primary)' : '2px solid transparent',
        outlineOffset: 2,
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {/* Icon circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.65)' }}
      >
        <span style={{ color: iconColor ?? '#555', display: 'flex' }}>
          {icon}
        </span>
      </div>

      {/* Label */}
      <span
        className="text-sm mt-2"
        style={{
          color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </span>
    </button>
  )
}

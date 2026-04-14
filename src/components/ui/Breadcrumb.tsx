import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>&gt;</span>}
          {item.to && i < items.length - 1 ? (
            <Link to={item.to} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span
              style={i === items.length - 1 ? { color: 'var(--color-text-primary)', fontWeight: 500 } : {}}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

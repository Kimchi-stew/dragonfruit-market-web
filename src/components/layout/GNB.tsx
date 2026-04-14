import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, ShoppingCart, User, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: '전체', to: '/products' },
  { label: '뷰티', to: '/products?category=beauty' },
  { label: '패션', to: '/products?category=fashion' },
  { label: '식품', to: '/products?category=food' },
  { label: '가전', to: '/products?category=tool' },
]

export default function GNB() {
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const searchParams = new URLSearchParams(location.search)
  const currentCategory = searchParams.get('category')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <header
      className="sticky top-0 z-50 bg-white"
      style={{
        borderBottom: '1px solid var(--color-border)',
        height: 56,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 text-[18px] font-bold tracking-tight"
          style={{ color: 'var(--color-primary)' }}
        >
          용과마켓
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 h-full">
          {NAV_ITEMS.map((item) => {
            const itemCategory = item.to.includes('category=') ? item.to.split('category=')[1] : null
            const isActive = location.pathname.startsWith('/products') && currentCategory === itemCategory

            return (
              <Link
                key={item.label}
                to={item.to}
                className="h-full flex items-center text-sm relative transition-colors hover:text-[#1A1A1A]"
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-0.5 rounded-full"
                    style={{ background: 'var(--color-primary)' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right area — pushed to end */}
        <div className="ml-auto flex items-center gap-1.5">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div
              className="flex items-center gap-2 border rounded-full px-3.5 py-1.5 bg-[#F7F7F7] transition-all duration-200"
              style={{
                borderColor: searchFocused ? 'var(--color-primary)' : 'transparent',
                width: searchFocused ? 260 : 180,
              }}
            >
              <Search size={14} className="shrink-0" style={{ color: 'var(--color-text-disabled)' }} />
              <input
                type="text"
                placeholder="상품 검색"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="text-sm bg-transparent outline-none w-full"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </div>
          </form>

          {/* Icon buttons */}
          {[
            { icon: Bell, to: null, badge: null },
          ].map(({ icon: Icon }, i) => (
            <button
              key={i}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#F5F5F5] hidden sm:flex"
            >
              <Icon size={19} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          ))}

          <Link
            to="/cart"
            className="w-9 h-9 rounded-full flex items-center justify-center relative transition-colors hover:bg-[#F5F5F5] hidden sm:flex"
          >
            <ShoppingCart size={19} style={{ color: 'var(--color-text-secondary)' }} />
            <span
              className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-white font-bold"
              style={{ fontSize: 9, background: 'var(--color-primary)', padding: '0 3px' }}
            >
              3
            </span>
          </Link>

          <Link
            to="/mypage"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#F5F5F5] hidden sm:flex"
          >
            <User size={19} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>

          <Link
            to="/login"
            className="hidden sm:flex text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors hover:bg-[#F5F5F5]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            로그인
          </Link>

          {/* Mobile hamburger */}
          <button
            className="w-9 h-9 flex items-center justify-center md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen
              ? <X size={20} style={{ color: 'var(--color-text-primary)' }} />
              : <Menu size={20} style={{ color: 'var(--color-text-primary)' }} />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden bg-white border-t px-6 py-5 flex flex-col gap-4 animate-fade-up"
          style={{ borderColor: 'var(--color-border)', animationDuration: '0.3s' }}
        >
          <form onSubmit={handleSearch}>
            <div
              className="flex items-center gap-2 border rounded-full px-4 py-2 bg-[#F7F7F7]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Search size={15} style={{ color: 'var(--color-text-disabled)' }} />
              <input
                type="text"
                placeholder="상품 검색"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="text-sm bg-transparent outline-none w-full"
              />
            </div>
          </form>

          <nav className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => {
              const itemCategory = item.to.includes('category=') ? item.to.split('category=')[1] : null
              const isActive = location.pathname.startsWith('/products') && currentCategory === itemCategory

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
                  style={{
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontWeight: isActive ? 700 : 500,
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div
            className="flex gap-5 pt-3 border-t text-sm"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Link to="/cart" className="flex items-center gap-1.5" onClick={() => setMobileOpen(false)}>
              <ShoppingCart size={15} /> 장바구니
            </Link>
            <Link to="/mypage" className="flex items-center gap-1.5" onClick={() => setMobileOpen(false)}>
              <User size={15} /> 마이페이지
            </Link>
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              로그인
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, ShoppingCart, User, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { alarmApi, type AlarmItem } from '../../api/alarm'

const NAV_ITEMS = [
  { label: '전체', to: '/products' },
  { label: '뷰티', to: '/products?category=beauty' },
  { label: '패션', to: '/products?category=fashion' },
  { label: '식품', to: '/products?category=food' },
  { label: '가전', to: '/products?category=tool' },
  { label: '상점', to: '/sellers' },
]

export default function GNB() {
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [alarms, setAlarms] = useState<AlarmItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const bellRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const searchParams = new URLSearchParams(location.search)
  const currentCategory = searchParams.get('category')

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // 로그인 시 읽지 않은 알림 수 조회
  useEffect(() => {
    if (!user) { setUnreadCount(0); return }
    alarmApi.getUnreadCount()
      .then((count) => setUnreadCount(count))
      .catch(() => setUnreadCount(0))
  }, [user])

  // 벨 열릴 때 알림 목록 조회
  useEffect(() => {
    if (!bellOpen || !user) return
    alarmApi.getUnreadList(0, 10)
      .then((page) => {
        setAlarms(page.content ?? [])
        setUnreadCount(0)
      })
      .catch(() => setAlarms([]))
  }, [bellOpen, user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <header
      className="sticky top-0 z-50 bg-white"
      style={{ borderBottom: '1px solid var(--color-border)', height: 56 }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 text-[20px] tracking-tight"
          style={{ color: 'var(--color-primary)', fontFamily: 'YeogiOttaeJalnan' }}
        >
          용과마켓
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 h-full">
          {NAV_ITEMS.map((item) => {
            const itemCategory = item.to.includes('category=') ? item.to.split('category=')[1] : null
            const isActive = item.to === '/sellers'
              ? location.pathname.startsWith('/sellers')
              : location.pathname.startsWith('/products') && currentCategory === itemCategory
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

        {/* Right area */}
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

          {/* 알림 벨 */}
          <div ref={bellRef} className="relative hidden sm:block">
            <button
              onClick={() => setBellOpen((v) => !v)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#F5F5F5]"
            >
              <Bell size={19} style={{ color: bellOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ fontSize: 9, background: 'var(--color-primary)', padding: '0 3px' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-2xl border overflow-hidden z-50"
                style={{
                  borderColor: 'var(--color-border)',
                  background: '#fff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>알림</span>
                  <button className="text-xs" style={{ color: 'var(--color-text-secondary)' }} onClick={() => setBellOpen(false)}>
                    닫기
                  </button>
                </div>
                {alarms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Bell size={28} style={{ color: 'var(--color-text-disabled)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>알림이 없습니다</p>
                  </div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: 'var(--color-border)' }}>
                    {alarms.map((alarm) => (
                      <li key={alarm.id} className="px-4 py-3">
                        <p className="text-sm" style={{ color: alarm.read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', fontWeight: alarm.read ? 400 : 600 }}>
                          {alarm.content}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-disabled)' }}>
                          {new Date(alarm.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 장바구니 */}
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

          {/* 로그인 상태에 따른 버튼 */}
          {user ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                to="/mypage"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-[#F5F5F5]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {user.nickname.charAt(0).toUpperCase()}
                </div>
                {user.nickname}
              </Link>
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#F5F5F5]"
                title="로그아웃"
              >
                <LogOut size={17} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}

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
              const isActive = item.to === '/sellers'
                ? location.pathname.startsWith('/sellers')
                : location.pathname.startsWith('/products') && currentCategory === itemCategory
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-sm font-medium transition-colors"
                  style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)', fontWeight: isActive ? 700 : 500 }}
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
            {user ? (
              <>
                <Link to="/mypage" className="flex items-center gap-1.5" onClick={() => setMobileOpen(false)}>
                  <User size={15} /> {user.nickname}
                </Link>
                <button className="flex items-center gap-1.5" onClick={handleLogout}>
                  <LogOut size={15} /> 로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/mypage" className="flex items-center gap-1.5" onClick={() => setMobileOpen(false)}>
                  <User size={15} /> 마이페이지
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

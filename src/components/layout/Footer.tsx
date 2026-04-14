import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#1F1F1F' }}>
      <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
            용과마켓
          </span>
          <span className="text-xs" style={{ color: '#757575' }}>
            © 2026 Dragonfruit Market. All rights reserved.
          </span>
        </div>
        <nav className="flex items-center gap-4 text-xs" style={{ color: '#757575' }}>
          <Link to="/terms" className="hover:text-white transition-colors">이용약관</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">개인정보보호정책</Link>
          <Link to="/support" className="hover:text-white transition-colors">고객센터</Link>
          <Link to="/seller" className="hover:text-white transition-colors">판매자 등록</Link>
        </nav>
      </div>
    </footer>
  )
}

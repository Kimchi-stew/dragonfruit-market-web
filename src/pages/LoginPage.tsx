import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth, ApiError } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('로그인 중 오류가 발생했습니다')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] flex flex-col gap-6 animate-fade-up">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            용과마켓
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            언제나 다채로운 하나의 쇼핑 플랫폼
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: 'rgba(244,67,54,0.08)', color: 'var(--color-error)' }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer transition-colors hover:text-[#1A1A1A]" style={{ color: 'var(--color-text-secondary)' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((v) => !v)}
                className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer hover:scale-105 transition-transform"
              />
              로그인 상태 유지
            </label>
            <Link to="/forgot" className="hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
              비밀번호 찾기
            </Link>
          </div>

          <Button type="submit" size="full" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>또는</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Social login */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full h-12 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95"
            style={{ background: 'var(--color-kakao)', color: '#1A1A1A' }}
          >
            카카오로 로그인
          </button>
          <button
            className="w-full h-12 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95"
            style={{ background: 'var(--color-naver)' }}
          >
            네이버로 로그인
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          아직 계정이 없으신가요?{' '}
          <Link to="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

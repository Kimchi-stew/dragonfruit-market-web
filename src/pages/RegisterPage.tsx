import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth, ApiError } from '../contexts/AuthContext'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [allAgreed, setAllAgreed] = useState(false)
  const [terms, setTerms] = useState({ service: false, privacy: false, marketing: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signup } = useAuth()
  const navigate = useNavigate()

  const passwordStrength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3

  const strengthLabel = ['', '약함', '보통', '강함'][passwordStrength]
  const strengthColor = ['', 'var(--color-error)', 'var(--color-star)', 'var(--color-success)'][passwordStrength]

  const handleAllAgreed = () => {
    const next = !allAgreed
    setAllAgreed(next)
    setTerms({ service: next, privacy: next, marketing: next })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPw) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }
    if (!terms.service || !terms.privacy) {
      setError('필수 약관에 동의해주세요')
      return
    }

    const genderMap: Record<string, 'M' | 'F' | null> = {
      '남성': 'M',
      '여성': 'F',
      '선택 안함': null,
    }

    setLoading(true)
    try {
      await signup({
        email,
        password,
        nickname,
        gender: gender ? (genderMap[gender] ?? null) : null,
      })
      navigate('/login')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('회원가입 중 오류가 발생했습니다')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px] flex flex-col gap-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            용과마켓
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            회원가입
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
            label="닉네임"
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />

          {/* Password with strength */}
          <div className="flex flex-col gap-1.5">
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(passwordStrength / 3) * 100}%`, background: strengthColor }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호 재입력"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            error={confirmPw.length > 0 && confirmPw !== password ? '비밀번호가 일치하지 않아요' : undefined}
            required
          />

          {/* Gender */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>성별</p>
            <div className="flex gap-2">
              {['남성', '여성', '선택 안함'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className="flex-1 py-2 text-sm font-medium border rounded-[8px] transition-colors"
                  style={
                    g === gender
                      ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                      : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div
            className="flex flex-col gap-2 p-4 rounded-[8px] border"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={handleAllAgreed}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
              전체 동의
            </label>
            <div className="h-px" style={{ background: 'var(--color-border)' }} />
            {[
              { key: 'service',   label: '이용약관 동의 (필수)' },
              { key: 'privacy',   label: '개인정보 수집 및 이용 동의 (필수)' },
              { key: 'marketing', label: '마케팅 정보 수신 동의 (선택)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={terms[key as keyof typeof terms]}
                  onChange={() => {
                    const next = { ...terms, [key]: !terms[key as keyof typeof terms] }
                    setTerms(next)
                    setAllAgreed(Object.values(next).every(Boolean))
                  }}
                  className="w-4 h-4 accent-[var(--color-primary)]"
                />
                {label}
              </label>
            ))}
          </div>

          <Button type="submit" size="full" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { userApi } from '../api/auth'
import { ApiError } from '../api/client'

export default function SocialSignupPage() {
  const [nickname, setNickname] = useState('')
  const [gender, setGender]     = useState<string | null>(null)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const genderMap: Record<string, 'M' | 'W' | null> = {
    '남성': 'M',
    '여성': 'W',
    '선택 안함': null,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) { setError('닉네임을 입력해주세요'); return }
    setError('')
    setLoading(true)
    try {
      await userApi.socialSignup({
        nickname: nickname.trim(),
        gender: gender ? (genderMap[gender] ?? null) : null,
      })
      const profileRes = await userApi.getProfile()
      localStorage.setItem('user', JSON.stringify(profileRes.data))
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>용과마켓</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            추가 정보를 입력해주세요
          </p>
        </div>

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
            label="닉네임"
            placeholder="사용할 닉네임을 입력해주세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />

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

          <Button type="submit" size="full" disabled={loading}>
            {loading ? '처리 중...' : '시작하기'}
          </Button>
        </form>
      </div>
    </div>
  )
}

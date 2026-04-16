import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, type SignupBody } from '../api/auth'
import { ApiError } from '../api/client'

interface User {
  email: string
  nickname: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (body: SignupBody) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

function saveUser(user: User) {
  localStorage.setItem('user', JSON.stringify(user))
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 앱 시작 시 자동 로그인
  useEffect(() => {
    const tryAutoLogin = async () => {
      const refreshToken = localStorage.getItem('refreshToken')
      const savedUser = loadUser()

      if (!refreshToken || !savedUser) {
        setLoading(false)
        return
      }

      try {
        const res = await authApi.autoLogin(refreshToken)
        saveTokens(res.data.accessToken, res.data.refreshToken)
        setUser(savedUser)
      } catch {
        clearTokens()
      } finally {
        setLoading(false)
      }
    }

    tryAutoLogin()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    const { accessToken, refreshToken } = res.data

    // 이메일에서 @ 앞부분을 임시 닉네임으로 사용 (로그인 응답에 닉네임 없음)
    const savedUser = loadUser()
    const nickname = savedUser?.email === email ? savedUser.nickname : email.split('@')[0]
    const userInfo: User = { email, nickname }

    saveTokens(accessToken, refreshToken)
    saveUser(userInfo)
    setUser(userInfo)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // 서버 에러와 무관하게 로컬 상태 초기화
    } finally {
      clearTokens()
      setUser(null)
    }
  }, [])

  const signup = useCallback(async (body: SignupBody) => {
    await authApi.signup(body)
    // 회원가입 후 자동 로그인을 위해 유저 정보 임시 저장
    saveUser({ email: body.email, nickname: body.nickname })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { ApiError }

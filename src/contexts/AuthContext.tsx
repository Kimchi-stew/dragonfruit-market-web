import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, userApi, type SignupBody, type UserProfile } from '../api/auth'
import { ApiError } from '../api/client'

export type User = UserProfile

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (body: SignupBody) => Promise<void>
  refreshUser: () => Promise<void>
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


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 앱 시작 시 자동 로그인
  useEffect(() => {
    const tryAutoLogin = async () => {
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        setLoading(false)
        return
      }

      try {
        const res = await authApi.autoLogin(refreshToken)
        saveTokens(res.data.accessToken, res.data.refreshToken)
        // 토큰 갱신 후 실제 프로필 조회
        const profileRes = await userApi.getProfile()
        saveUser(profileRes.data)
        setUser(profileRes.data)
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
    saveTokens(accessToken, refreshToken)

    // 로그인 후 실제 프로필 조회
    const profileRes = await userApi.getProfile()
    saveUser(profileRes.data)
    setUser(profileRes.data)
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
  }, [])

  const refreshUser = useCallback(async () => {
    const profileRes = await userApi.getProfile()
    saveUser(profileRes.data)
    setUser(profileRes.data)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, refreshUser }}>
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

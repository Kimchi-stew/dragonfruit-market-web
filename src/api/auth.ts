import { api } from './client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SignupBody {
  email: string
  password: string
  nickname: string
  gender: 'M' | 'F' | null
  profileImage?: string
}

export const authApi = {
  signup: (body: SignupBody) =>
    api.post<ApiResponse<Record<string, never>>>('/users/signup', body),

  login: (body: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>('/auth/login', body),

  logout: () =>
    api.post<ApiResponse<Record<string, never>>>('/auth/log-out'),

  autoLogin: (refreshToken: string) =>
    api.post<ApiResponse<AuthTokens>>('/auth/auto-login', { refreshToken }),
}

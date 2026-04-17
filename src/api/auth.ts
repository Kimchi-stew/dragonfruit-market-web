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

export interface UserProfile {
  id: number
  email: string
  nickname: string
  gender: 'M' | 'F' | null
  profileImage: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileBody {
  email?: string
  nickname?: string
  gender?: 'M' | 'F' | null
  profileImage?: string | null
}

export interface UpdatePasswordBody {
  password: string
  newPassword: string
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

import type { ProductSummary } from './products'
import type { Seller, SellerSummary } from './sellers'
import type { ReviewDetail } from './reviews'

export const userApi = {
  getProfile: () =>
    api.get<ApiResponse<UserProfile>>('/users/profile'),

  updateProfile: (body: UpdateProfileBody) =>
    api.put<ApiResponse<UserProfile>>('/users/profile', body),

  updatePassword: (body: UpdatePasswordBody) =>
    api.put<ApiResponse<Record<string, never>>>('/users/profile/password', body),

  getWishProducts: () =>
    api.get<ApiResponse<ProductSummary[]>>('/users/wish/products'),

  getMySeller: () =>
    api.get<ApiResponse<Seller>>('/users/sellers'),

  getMyReviews: () =>
    api.get<ApiResponse<ReviewDetail[]>>('/users/reviews'),

  getMyProducts: () =>
    api.get<ApiResponse<ProductSummary[]>>('/users/products'),

  getLikedSellers: () =>
    api.get<ApiResponse<SellerSummary[]>>('/users/likes/sellers'),

  getLikedProducts: (sort?: string) =>
    api.get<ApiResponse<ProductSummary[]>>(`/users/likes/products${sort ? `?sort=${sort}` : ''}`),

  getFollowedSellers: () =>
    api.get<ApiResponse<SellerSummary[]>>('/users/follow/sellers'),
}

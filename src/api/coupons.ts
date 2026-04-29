import { api } from './client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface UserCoupon {
  userCouponId: number
  code: string
  discountType: 'RATE' | 'FIXED'
  discountValue: number
  minOrderPrice: number
  expiresAt: string
  used: boolean
}

export const couponsApi = {
  getMyCoupons: () =>
    api.get<ApiResponse<UserCoupon[]>>('/coupons/me'),

  register: (code: string) =>
    api.post<ApiResponse<UserCoupon>>('/coupons/register', { code }),
}
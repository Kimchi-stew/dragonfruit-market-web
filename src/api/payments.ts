import { api } from './client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface PaymentReadyResponse {
  tossOrderId: string
  orderName: string
  amount: number
  customerName: string
}

export interface TossPaymentResponse {
  paymentKey: string
  orderId: string
  orderName: string
  totalAmount: number
  status: string
  method: string
  requestedAt: string
  approvedAt: string
}

export const paymentsApi = {
  ready: (orderId: number) =>
    api.post<ApiResponse<PaymentReadyResponse>>('/payments/ready', { orderId }),

  confirm: (paymentKey: string, orderId: string, amount: number) =>
    api.post<ApiResponse<TossPaymentResponse>>('/payments/confirm', { paymentKey, orderId, amount }),

  cancel: (paymentKey: string, cancelReason: string, cancelAmount?: number) =>
    api.post<ApiResponse<unknown>>(`/payments/${paymentKey}/cancel`, {
      cancelReason,
      ...(cancelAmount !== undefined ? { cancelAmount } : {}),
    }),

  fail: (orderId: number, code: string, message: string) =>
    api.post<ApiResponse<{ orderId: number; paymentStatus: string }>>('/payments/fail', { orderId, code, message }),

  getOne: (paymentKey: string) =>
    api.get<ApiResponse<TossPaymentResponse>>(`/payments/${paymentKey}`),

  getByOrder: (orderId: number) =>
    api.get<ApiResponse<TossPaymentResponse>>(`/payments/orders/${orderId}`),
}
import { api } from './client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  itemPrice: number
  totalPrice: number
}

export interface OrderSummary {
  orderId: number
  orderStatus: 'WAITING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: string
  totalPrice: number
  createdAt: string
  items: OrderItem[]
}

export interface OrderDetail extends OrderSummary {
  address: string
  shippedAt: string | null
  deliveredAt: string | null
}

export interface OrderPage {
  totalPages: number
  totalElements: number
  content: OrderSummary[]
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CreateOrderBody {
  address: string
  orderItems: { productId: number; quantity: number }[]
  couponId?: number
}

export interface CreateOrderResponse {
  orderId: number
  originalTotalPrice: number
  discountAmount: number
  totalPrice: number
  orderStatus: string
  paymentStatus: string
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  WAITING:   '결제완료',
  PAID:      '결제완료',
  SHIPPED:   '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소',
}

export const ordersApi = {
  getAll: (page = 0, size = 10) => {
    const q = new URLSearchParams()
    q.set('pageable', JSON.stringify({ page, size, sort: [] }))
    return api.get<ApiResponse<OrderPage>>(`/orders?${q}`)
  },

  getOne: (id: number) =>
    api.get<ApiResponse<OrderDetail>>(`/orders/${id}`),

  create: (body: CreateOrderBody) =>
    api.post<ApiResponse<CreateOrderResponse>>('/orders', body),

  cancel: (id: number) =>
    api.delete<ApiResponse<unknown>>(`/orders/${id}`),

  updateStatus: (id: number, orderStatus: string) =>
    api.patch<ApiResponse<OrderSummary>>(`/orders/${id}/status`, { orderStatus }),
}
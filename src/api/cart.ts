import { api } from './client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  quantity: number
  pricePerItem: number
  totalPrice: number
}

export interface Cart {
  items: CartItem[]
  totalQuantity: number
  totalPrice: number
}

export const cartApi = {
  get: () =>
    api.get<ApiResponse<Cart>>('/cart'),

  add: (productId: number, quantity: number) =>
    api.post<ApiResponse<{ id: number; seller: { id: number; storeName: string; image: string }; name: string; price: number }>>('/cart', { productId, quantity }),

  remove: (productId: number, quantity: number) =>
    api.delete<ApiResponse<Record<string, never>>>('/cart', { productId, quantity }),
}

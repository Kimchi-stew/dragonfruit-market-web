import { api } from './client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface Seller {
  id: number
  userId: number
  storeName: string
  description: string
  image: string
  createdAt: string
  likeCount: number
  followCount: number
  followed: boolean
}

export interface SellerSummary {
  id: number
  storeName: string
  image: string
  likeCount: number
  followCount: number
}

export interface CreateSellerBody {
  storeName: string
  description: string
  image?: string
}

export interface UpdateSellerBody {
  storeName: string
  description: string
  image?: string
}

export const sellersApi = {
  getAll: (sort?: string) =>
    api.get<ApiResponse<SellerSummary[]>>(`/sellers${sort ? `?sort=${sort}` : ''}`),

  getOne: (id: number) =>
    api.get<ApiResponse<Seller>>(`/sellers/${id}`),

  create: (body: CreateSellerBody) =>
    api.post<ApiResponse<Seller>>('/sellers', body),

  update: (id: number, body: UpdateSellerBody) =>
    api.put<ApiResponse<Seller>>(`/sellers/${id}`, body),

  remove: (id: number) =>
    api.delete<ApiResponse<{ storeName: string; image: string; deletedAt: string }>>(`/sellers/${id}`),

  like: (id: number) =>
    api.post<ApiResponse<{ liked: boolean; likeCount: number }>>(`/sellers/likes/${id}`),

  follow: (id: number) =>
    api.post<ApiResponse<{ followed: boolean }>>(`/sellers/follow/${id}`),
}

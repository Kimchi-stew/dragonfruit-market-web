import { api } from './client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface ReviewUser {
  id: number
  email: string
  profileImage: string
  nickname: string
}

export interface ReviewProduct {
  id: number
  seller: { id: number; storeName: string; image: string }
  name: string
  price: number
}

export interface ReviewSummary {
  id: number
  user: ReviewUser
  rating: number
  content: string
  createdAt: string
  image: string
  likeCount: number
}

export interface ReviewDetail {
  id: number
  product: ReviewProduct
  user: ReviewUser
  rating: number
  content: string
  createdAt: string
  updatedAt: string
  images: string[]
  likeCount: number
}

export interface CreateReviewBody {
  rating: number
  content: string
  images?: string[]
}

export const reviewsApi = {
  getByProduct: (productId: number, params?: { sortType?: string; ratingSortType?: string }) => {
    const q = new URLSearchParams()
    if (params?.sortType) q.set('sortType', params.sortType)
    if (params?.ratingSortType) q.set('ratingSortType', params.ratingSortType)
    const qs = q.toString()
    return api.get<ApiResponse<ReviewSummary[]>>(`/reviews/products/${productId}${qs ? `?${qs}` : ''}`)
  },

  getOne: (reviewId: number) =>
    api.get<ApiResponse<ReviewDetail>>(`/reviews/${reviewId}`),

  create: (productId: number, body: CreateReviewBody) =>
    api.post<ApiResponse<ReviewDetail>>(`/reviews/products/${productId}`, body),

  update: (reviewId: number, body: CreateReviewBody) =>
    api.put<ApiResponse<ReviewDetail>>(`/reviews/${reviewId}`, body),

  remove: (reviewId: number) =>
    api.delete<ApiResponse<unknown>>(`/reviews/${reviewId}`),

  like: (reviewId: number) =>
    api.post<ApiResponse<{ liked: boolean; likeCount: number }>>(`/reviews/likes/${reviewId}`),
}

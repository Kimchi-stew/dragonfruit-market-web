import { api } from './client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface SellerRef {
  id: number
  storeName: string
  image: string
}

export interface ProductSummary {
  id: number
  seller: SellerRef
  name: string
  price: number
  image: string
  likeCount: number
}

export interface ProductDetail {
  id: number
  seller: SellerRef
  name: string
  price: number
  description: string
  stock: number
  likeCount: number
  images: string[]
  createdAt: string
  updatedAt: string
  wished: boolean
  category: string
  rating: number
}

export interface ProductPage {
  totalPages: number
  totalElements: number
  content: ProductSummary[]
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface ProductsParams {
  page?: number
  size?: number
  productCategoryType?: string
  priceSortType?: string
  sortType?: string
  genderRole?: string
}

export interface CreateProductBody {
  name: string
  price: number
  description: string
  stock: number
  images: string[]
  category: string
}

export const productsApi = {
  getAll: (params: ProductsParams = {}) => {
    const q = new URLSearchParams()
    q.set('pageable', JSON.stringify({ page: params.page ?? 0, size: params.size ?? 12, sort: [] }))
    if (params.productCategoryType) q.set('productCategoryType', params.productCategoryType)
    if (params.priceSortType) q.set('priceSortType', params.priceSortType)
    if (params.sortType) q.set('sortType', params.sortType)
    if (params.genderRole) q.set('genderRole', params.genderRole)
    return api.get<ApiResponse<ProductPage>>(`/products?${q}`)
  },

  search: (keyword: string) =>
    api.get<ApiResponse<ProductSummary[]>>(`/products/search?keyword=${encodeURIComponent(keyword)}`),

  getOne: (id: number) =>
    api.get<ApiResponse<ProductDetail>>(`/products/${id}`),

  create: (body: CreateProductBody) =>
    api.post<ApiResponse<ProductDetail>>('/products', body),

  update: (id: number, body: Partial<CreateProductBody>) =>
    api.put<ApiResponse<ProductDetail>>(`/products/${id}`, body),

  remove: (id: number) =>
    api.delete<ApiResponse<{ name: string; image: string; deletedAt: string }>>(`/products/${id}`),

  wish: (id: number) =>
    api.post<ApiResponse<{ wished: boolean }>>(`/products/wish/${id}`),

  like: (id: number) =>
    api.post<ApiResponse<{ liked: boolean; likeCount: number }>>(`/products/likes/${id}`),

  getCategories: () =>
    api.get<ApiResponse<{ id: number; name: string; createdAt: string }[]>>('/products/category'),
}

// 프론트엔드 카테고리 키 → API 값
export const CATEGORY_TO_API: Record<string, string> = {
  beauty:  'BEAUTY',
  fashion: 'FASHION',
  food:    'FOOD',
  tool:    'ELECTRONICS',
}

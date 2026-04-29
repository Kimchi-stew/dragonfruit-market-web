import { api } from './client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface InquirySummary {
  inquiryId: number
  title: string
  content: string
  createdAt: string
  status: 'PENDING' | 'ANSWERED'
}

export interface CreateInquiryBody {
  productId?: number
  sellerId?: number
  title: string
  content: string
}

export const inquiriesApi = {
  create: (body: CreateInquiryBody) =>
    api.post<ApiResponse<InquirySummary>>('/inquiries', body),

  getMyInquiries: () =>
    api.get<ApiResponse<InquirySummary[]>>('/inquiries/me'),
}
import { api } from './client'

const BASE_URL = '/api'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface MediaFile {
  mediaId: number
  url: string
  entityType: string
  entityId: number
  createdAt: string
}

export const filesApi = {
  upload: async (file: File, entityType: 'PRODUCT' | 'REVIEW' | 'PROFILE'): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE_URL}/files/upload?entityType=${entityType}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: form,
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.message ?? '업로드 실패')
    return json.data.url as string
  },

  getFiles: (entityType: string, entityId: number) =>
    api.get<ApiResponse<MediaFile[]>>(`/files?entityType=${entityType}&entityId=${entityId}`),

  deleteFile: (mediaId: number) =>
    api.delete<ApiResponse<unknown>>(`/files/${mediaId}`),
}

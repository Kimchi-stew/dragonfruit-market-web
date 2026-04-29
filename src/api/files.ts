const BASE_URL = '/api'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
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
}

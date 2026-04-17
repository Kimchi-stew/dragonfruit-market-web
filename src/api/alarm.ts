import { api } from './client'

export interface AlarmItem {
  id: number
  type: string
  content: string
  targetId: number
  createdAt: string
  read: boolean
}

export interface AlarmPage {
  totalPages: number
  totalElements: number
  content: AlarmItem[]
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

function pageableQuery(page = 0, size = 20) {
  return `pageable=${encodeURIComponent(JSON.stringify({ page, size, sort: [] }))}`
}

export const alarmApi = {
  getAll: (page = 0, size = 20) =>
    api.rawGet<AlarmPage>(`/alarm?${pageableQuery(page, size)}`),

  getUnreadCount: () =>
    api.rawGet<number>('/alarm/unread'),

  getUnreadList: (page = 0, size = 20) =>
    api.rawGet<AlarmPage>(`/alarm/unreadList?${pageableQuery(page, size)}`),
}

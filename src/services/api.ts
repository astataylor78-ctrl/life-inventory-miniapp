import { callCloud } from './cloud'
import type { Category, Item, ItemInput, Location, Session } from '@/types/models'

export const authApi = { init: () => callCloud<Session>('auth-init') }
export const categoryApi = {
  list: () => callCloud<Category[]>('catalog', { resource: 'category', action: 'list' }),
  save: (payload: Partial<Category>) =>
    callCloud<Category>('catalog', { resource: 'category', action: 'save', payload }),
  disable: (id: string) =>
    callCloud<void>('catalog', { resource: 'category', action: 'disable', payload: { id } }),
}
export const locationApi = {
  list: () => callCloud<Location[]>('catalog', { resource: 'location', action: 'list' }),
  save: (payload: Partial<Location>) =>
    callCloud<Location>('catalog', { resource: 'location', action: 'save', payload }),
  disable: (id: string) =>
    callCloud<void>('catalog', { resource: 'location', action: 'disable', payload: { id } }),
}
export interface ItemQuery {
  keyword?: string
  categoryId?: string
  locationId?: string
  sort?: string
  archived?: boolean
}
export const itemApi = {
  list: (query: ItemQuery) => callCloud<Item[]>('items', { action: 'list', payload: query }),
  get: (id: string) => callCloud<Item>('items', { action: 'get', payload: { id } }),
  save: (payload: ItemInput) =>
    callCloud<Item>('items', { action: payload._id ? 'update' : 'create', payload }),
  archive: (id: string) => callCloud<void>('items', { action: 'archive', payload: { id } }),
}

export interface Session {
  userId: string
  householdId: string
  householdName: string
}
export interface Category {
  _id: string
  name: string
  icon?: string
  sortOrder: number
  isActive: boolean
}
export interface Location {
  _id: string
  parentId: string | null
  name: string
  sortOrder: number
  isActive: boolean
}
export interface Item {
  _id: string
  name: string
  brand: string | null
  imageUrls: string[]
  categoryId: string | null
  locationId: string | null
  quantityScaled: number
  unit: string
  minQuantityScaled: number
  targetQuantityScaled: number | null
  note: string | null
  isArchived: boolean
  updatedAt?: string
}
export interface ItemInput extends Omit<Item, '_id' | 'isArchived' | 'updatedAt'> {
  _id?: string
}

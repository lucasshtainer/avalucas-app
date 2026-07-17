export type MediaType = 'photo' | 'video'

export interface GalleryItem {
  id: string
  url: string
  type: MediaType
  timestamp: number
  localDataUrl?: string
}

export interface BeRealPost {
  id: string
  dateKey: string
  user: 'Lucas' | 'Ava'
  url: string
  timestamp: number
  localDataUrl?: string
}

export type WishlistItemType = 'text' | 'link'
export type WishlistStatus = 'active' | 'gifted'

export interface WishlistSection {
  id: string
  name: string
  emoji: string
  order: number
}

export interface WishlistItem {
  id: string
  sectionId: string
  type: WishlistItemType
  title: string
  note?: string
  price?: string
  url?: string
  status: WishlistStatus
  hearted: boolean
  createdAt: number
}

export type AppScreen = 'intro' | 'login' | 'main'
export type MainTab = 'gallery' | 'bereal' | 'wishlist' | 'memories'

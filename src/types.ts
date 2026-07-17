import type { PartnerName } from './config'

export type MediaType = 'photo' | 'video'

export interface GalleryItem {
  id: string
  url: string
  type: MediaType
  timestamp: number
  uploader: PartnerName
  /** Optional data URL / local blob for offline fallback */
  localDataUrl?: string
}

export interface BeRealPost {
  id: string
  dateKey: string
  user: PartnerName
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
  heartedBy: PartnerName[]
  createdAt: number
}

export type AppScreen = 'intro' | 'login' | 'identity' | 'main'
export type MainTab = 'gallery' | 'bereal' | 'wishlist' | 'memories'

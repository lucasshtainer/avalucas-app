import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import type { WishlistItem, WishlistSection } from '../types'

const POLL_MS = 4000
const DEFAULT_SECTIONS: WishlistSection[] = [
  { id: 'clothes', name: 'Clothes', emoji: '👗', order: 0 },
]

interface UseWishlistResult {
  sections: WishlistSection[]
  items: WishlistItem[]
  loading: boolean
  error: string | null
  itemsForSection: (sectionId: string) => {
    active: WishlistItem[]
    gifted: WishlistItem[]
  }
  addSection: (name: string, emoji: string) => Promise<void>
  addItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'status' | 'hearted'>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  markGifted: (id: string) => Promise<void>
  toggleHeart: (id: string) => Promise<void>
}

function normalizeItem(raw: WishlistItem & { heartedBy?: string[] }): WishlistItem {
  return {
    ...raw,
    hearted:
      typeof raw.hearted === 'boolean'
        ? raw.hearted
        : Array.isArray(raw.heartedBy)
          ? raw.heartedBy.length > 0
          : false,
  }
}

export function useWishlist(): UseWishlistResult {
  const [sections, setSections] = useState<WishlistSection[]>(DEFAULT_SECTIONS)
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{
        sections: WishlistSection[]
        items: Array<WishlistItem & { heartedBy?: string[] }>
      }>('/api/wishlist')
      setSections(data.sections.length ? data.sections : DEFAULT_SECTIONS)
      setItems(data.items.map(normalizeItem))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const t = window.setInterval(() => void refresh(), POLL_MS)
    return () => window.clearInterval(t)
  }, [refresh])

  const addSection = useCallback(async (name: string, emoji: string) => {
    const section = await api.post<WishlistSection>('/api/wishlist/sections', { name, emoji })
    setSections((prev) => [...prev, section])
  }, [])

  const addItem = useCallback(
    async (partial: Omit<WishlistItem, 'id' | 'createdAt' | 'status' | 'hearted'>) => {
      const item = await api.post<WishlistItem>('/api/wishlist/items', partial)
      setItems((prev) => [normalizeItem(item), ...prev])
    },
    [],
  )

  const deleteItem = useCallback(async (id: string) => {
    await api.delete(`/api/wishlist/items/${id}`)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const markGifted = useCallback(async (id: string) => {
    const updated = await api.patch<WishlistItem>(`/api/wishlist/items/${id}`, {
      status: 'gifted',
    })
    setItems((prev) => prev.map((i) => (i.id === id ? normalizeItem(updated) : i)))
  }, [])

  const toggleHeart = useCallback(
    async (id: string) => {
      const target = items.find((i) => i.id === id)
      if (!target) return
      const updated = await api.patch<WishlistItem>(`/api/wishlist/items/${id}`, {
        hearted: !target.hearted,
      })
      setItems((prev) => prev.map((i) => (i.id === id ? normalizeItem(updated) : i)))
    },
    [items],
  )

  const itemsForSection = useCallback(
    (sectionId: string) => {
      const sectionItems = items
        .filter((i) => i.sectionId === sectionId)
        .sort((a, b) => b.createdAt - a.createdAt)
      return {
        active: sectionItems.filter((i) => i.status === 'active'),
        gifted: sectionItems.filter((i) => i.status === 'gifted'),
      }
    },
    [items],
  )

  return useMemo(
    () => ({
      sections,
      items,
      loading,
      error,
      itemsForSection,
      addSection,
      addItem,
      deleteItem,
      markGifted,
      toggleHeart,
    }),
    [
      sections,
      items,
      loading,
      error,
      itemsForSection,
      addSection,
      addItem,
      deleteItem,
      markGifted,
      toggleHeart,
    ],
  )
}

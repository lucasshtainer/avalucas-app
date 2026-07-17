import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatMonthYear } from '../lib/dates'
import { api } from '../lib/api'
import type { GalleryItem, MediaType } from '../types'

const POLL_MS = 4000

interface UseGalleryResult {
  items: GalleryItem[]
  grouped: { label: string; items: GalleryItem[] }[]
  loading: boolean
  error: string | null
  uploading: boolean
  addMedia: (opts: {
    dataUrl: string
    type: MediaType
    mimeType: string
  }) => Promise<void>
  removeItem: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useGallery(): UseGalleryResult {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const next = await api.get<GalleryItem[]>('/api/gallery')
      setItems(next)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const t = window.setInterval(() => void refresh(), POLL_MS)
    return () => window.clearInterval(t)
  }, [refresh])

  const addMedia = useCallback(
    async (opts: { dataUrl: string; type: MediaType; mimeType: string }) => {
      setUploading(true)
      setError(null)
      try {
        const item = await api.post<GalleryItem>('/api/gallery', opts)
        setItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        throw err
      } finally {
        setUploading(false)
      }
    },
    [],
  )

  const removeItem = useCallback(async (id: string) => {
    await api.delete(`/api/gallery/${id}`)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, GalleryItem[]>()
    for (const item of items) {
      const label = formatMonthYear(item.timestamp)
      const list = map.get(label) ?? []
      list.push(item)
      map.set(label, list)
    }
    return Array.from(map.entries()).map(([label, groupItems]) => ({
      label,
      items: groupItems,
    }))
  }, [items])

  return { items, grouped, loading, error, uploading, addMedia, removeItem, refresh }
}

export function resolveMediaUrl(item: Pick<GalleryItem, 'url' | 'localDataUrl'>): string {
  return item.localDataUrl || item.url
}

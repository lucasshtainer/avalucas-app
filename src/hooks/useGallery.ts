import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { STORAGE_KEYS, type PartnerName } from '../config'
import { db, isFirebaseConfigured } from '../firebase'
import { createId } from '../lib/id'
import { readJson, writeJson } from '../lib/localStore'
import { uploadMedia } from '../lib/upload'
import type { GalleryItem, MediaType } from '../types'
import { formatMonthYear } from '../lib/dates'

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
    uploader: PartnerName
  }) => Promise<void>
  removeItem: (id: string) => Promise<void>
}

function sortNewest(a: GalleryItem, b: GalleryItem) {
  return b.timestamp - a.timestamp
}

export function useGallery(): UseGalleryResult {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured() || !db) {
      setItems(readJson<GalleryItem[]>(STORAGE_KEYS.localGallery, []).sort(sortNewest))
      setLoading(false)
      return
    }

    const q = query(collection(db, 'gallery'), orderBy('timestamp', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GalleryItem)
        setItems(next)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  const persistLocal = useCallback((next: GalleryItem[]) => {
    writeJson(STORAGE_KEYS.localGallery, next)
    setItems(next)
  }, [])

  const addMedia = useCallback(
    async (opts: {
      dataUrl: string
      type: MediaType
      mimeType: string
      uploader: PartnerName
    }) => {
      setUploading(true)
      setError(null)
      try {
        const url = await uploadMedia(opts.dataUrl, 'gallery', opts.mimeType)
        const item: GalleryItem = {
          id: createId('gal'),
          url,
          type: opts.type,
          timestamp: Date.now(),
          uploader: opts.uploader,
          localDataUrl: isFirebaseConfigured() ? undefined : opts.dataUrl,
        }

        if (isFirebaseConfigured() && db) {
          const { localDataUrl: _, ...payload } = item
          await setDoc(doc(db, 'gallery', item.id), payload)
        } else {
          const next = [item, ...readJson<GalleryItem[]>(STORAGE_KEYS.localGallery, [])]
          persistLocal(next)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        throw err
      } finally {
        setUploading(false)
      }
    },
    [persistLocal],
  )

  const removeItem = useCallback(
    async (id: string) => {
      if (isFirebaseConfigured() && db) {
        await deleteDoc(doc(db, 'gallery', id))
      } else {
        const next = readJson<GalleryItem[]>(STORAGE_KEYS.localGallery, []).filter((i) => i.id !== id)
        persistLocal(next)
      }
    },
    [persistLocal],
  )

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

  return { items, grouped, loading, error, uploading, addMedia, removeItem }
}

export function resolveMediaUrl(item: Pick<GalleryItem, 'url' | 'localDataUrl'>): string {
  return item.localDataUrl || item.url
}

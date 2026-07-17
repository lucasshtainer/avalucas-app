import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { STORAGE_KEYS, type PartnerName } from '../config'
import { db, isFirebaseConfigured } from '../firebase'
import { createId } from '../lib/id'
import { readJson, writeJson } from '../lib/localStore'
import type { WishlistItem, WishlistSection } from '../types'

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
  addItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'status' | 'heartedBy'>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  markGifted: (id: string) => Promise<void>
  toggleHeart: (id: string, user: PartnerName) => Promise<void>
}

export function useWishlist(): UseWishlistResult {
  const [sections, setSections] = useState<WishlistSection[]>(DEFAULT_SECTIONS)
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured() || !db) {
      const localSections = readJson<WishlistSection[]>(
        STORAGE_KEYS.localSections,
        DEFAULT_SECTIONS,
      )
      setSections(localSections.length ? localSections : DEFAULT_SECTIONS)
      setItems(readJson<WishlistItem[]>(STORAGE_KEYS.localWishlist, []))
      setLoading(false)
      return
    }

    const unsubSections = onSnapshot(
      collection(db, 'wishlistSections'),
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WishlistSection)
        if (next.length === 0 && db) {
          // Seed the default "Clothes" section once for both partners
          void setDoc(doc(db, 'wishlistSections', DEFAULT_SECTIONS[0].id), DEFAULT_SECTIONS[0])
          setSections(DEFAULT_SECTIONS)
          return
        }
        if (next.length === 0) {
          setSections(DEFAULT_SECTIONS)
          return
        }
        setSections(next.sort((a, b) => a.order - b.order))
      },
      (err) => setError(err.message),
    )

    const unsubItems = onSnapshot(
      collection(db, 'wishlist'),
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WishlistItem))
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => {
      unsubSections()
      unsubItems()
    }
  }, [])

  const persistLocal = useCallback((nextSections: WishlistSection[], nextItems: WishlistItem[]) => {
    writeJson(STORAGE_KEYS.localSections, nextSections)
    writeJson(STORAGE_KEYS.localWishlist, nextItems)
    setSections(nextSections)
    setItems(nextItems)
  }, [])

  const addSection = useCallback(
    async (name: string, emoji: string) => {
      const section: WishlistSection = {
        id: createId('sec'),
        name,
        emoji,
        order: sections.length,
      }
      if (isFirebaseConfigured() && db) {
        await setDoc(doc(db, 'wishlistSections', section.id), section)
      } else {
        persistLocal([...sections, section], items)
      }
    },
    [items, persistLocal, sections],
  )

  const addItem = useCallback(
    async (partial: Omit<WishlistItem, 'id' | 'createdAt' | 'status' | 'heartedBy'>) => {
      const item: WishlistItem = {
        ...partial,
        id: createId('wish'),
        createdAt: Date.now(),
        status: 'active',
        heartedBy: [],
      }
      if (isFirebaseConfigured() && db) {
        await setDoc(doc(db, 'wishlist', item.id), item)
      } else {
        persistLocal(sections, [item, ...items])
      }
    },
    [items, persistLocal, sections],
  )

  const deleteItem = useCallback(
    async (id: string) => {
      if (isFirebaseConfigured() && db) {
        await deleteDoc(doc(db, 'wishlist', id))
      } else {
        persistLocal(
          sections,
          items.filter((i) => i.id !== id),
        )
      }
    },
    [items, persistLocal, sections],
  )

  const markGifted = useCallback(
    async (id: string) => {
      if (isFirebaseConfigured() && db) {
        await updateDoc(doc(db, 'wishlist', id), { status: 'gifted' })
      } else {
        persistLocal(
          sections,
          items.map((i) => (i.id === id ? { ...i, status: 'gifted' as const } : i)),
        )
      }
    },
    [items, persistLocal, sections],
  )

  const toggleHeart = useCallback(
    async (id: string, user: PartnerName) => {
      const target = items.find((i) => i.id === id)
      if (!target) return
      const heartedBy = target.heartedBy.includes(user)
        ? target.heartedBy.filter((n) => n !== user)
        : [...target.heartedBy, user]

      if (isFirebaseConfigured() && db) {
        await updateDoc(doc(db, 'wishlist', id), { heartedBy })
      } else {
        persistLocal(
          sections,
          items.map((i) => (i.id === id ? { ...i, heartedBy } : i)),
        )
      }
    },
    [items, persistLocal, sections],
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

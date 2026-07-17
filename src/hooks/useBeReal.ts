import { useCallback, useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { STORAGE_KEYS, type PartnerName } from '../config'
import { db, isFirebaseConfigured } from '../firebase'
import { todayKey } from '../lib/dates'
import { readJson, writeJson } from '../lib/localStore'
import { uploadMedia } from '../lib/upload'
import type { BeRealPost } from '../types'

interface UseBeRealResult {
  posts: BeRealPost[]
  todayPosts: BeRealPost[]
  historyDays: { dateKey: string; posts: BeRealPost[] }[]
  loading: boolean
  error: string | null
  posting: boolean
  hasPostedToday: (user: PartnerName) => boolean
  getTodayPost: (user: PartnerName) => BeRealPost | undefined
  addPost: (opts: {
    dataUrl: string
    mimeType: string
    user: PartnerName
  }) => Promise<void>
}

export function useBeReal(): UseBeRealResult {
  const [posts, setPosts] = useState<BeRealPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const today = todayKey()

  useEffect(() => {
    if (!isFirebaseConfigured() || !db) {
      setPosts(readJson<BeRealPost[]>(STORAGE_KEYS.localBeReal, []))
      setLoading(false)
      return
    }

    const unsub = onSnapshot(
      collection(db, 'bereal'),
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BeRealPost)
        setPosts(next)
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

  const todayPosts = useMemo(
    () => posts.filter((p) => p.dateKey === today),
    [posts, today],
  )

  const historyDays = useMemo(() => {
    const byDay = new Map<string, BeRealPost[]>()
    for (const post of posts) {
      if (post.dateKey === today) continue
      const list = byDay.get(post.dateKey) ?? []
      list.push(post)
      byDay.set(post.dateKey, list)
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([dateKey, dayPosts]) => ({ dateKey, posts: dayPosts }))
  }, [posts, today])

  const hasPostedToday = useCallback(
    (user: PartnerName) => todayPosts.some((p) => p.user === user),
    [todayPosts],
  )

  const getTodayPost = useCallback(
    (user: PartnerName) => todayPosts.find((p) => p.user === user),
    [todayPosts],
  )

  const addPost = useCallback(
    async (opts: { dataUrl: string; mimeType: string; user: PartnerName }) => {
      setPosting(true)
      setError(null)
      try {
        const dateKey = todayKey()
        const existing = readJson<BeRealPost[]>(STORAGE_KEYS.localBeReal, [])
        const all = isFirebaseConfigured() ? posts : existing
        if (all.some((p) => p.dateKey === dateKey && p.user === opts.user)) {
          throw new Error("You've already posted today ♡")
        }

        const url = await uploadMedia(opts.dataUrl, 'bereal', opts.mimeType)
        const post: BeRealPost = {
          id: `${dateKey}_${opts.user}`,
          dateKey,
          user: opts.user,
          url,
          timestamp: Date.now(),
          localDataUrl: isFirebaseConfigured() ? undefined : opts.dataUrl,
        }

        if (isFirebaseConfigured() && db) {
          const { localDataUrl: _, ...payload } = post
          await setDoc(doc(db, 'bereal', post.id), payload)
        } else {
          const next = [...existing.filter((p) => p.id !== post.id), post]
          writeJson(STORAGE_KEYS.localBeReal, next)
          setPosts(next)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Post failed')
        throw err
      } finally {
        setPosting(false)
      }
    },
    [posts],
  )

  return {
    posts,
    todayPosts,
    historyDays,
    loading,
    error,
    posting,
    hasPostedToday,
    getTodayPost,
    addPost,
  }
}

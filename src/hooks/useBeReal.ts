import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BeRealUser } from '../config'
import { todayKey } from '../lib/dates'
import { api } from '../lib/api'
import type { BeRealPost } from '../types'

const POLL_MS = 4000

interface UseBeRealResult {
  posts: BeRealPost[]
  todayPosts: BeRealPost[]
  historyDays: { dateKey: string; posts: BeRealPost[] }[]
  loading: boolean
  error: string | null
  posting: boolean
  getTodayPost: (user: BeRealUser) => BeRealPost | undefined
  hasPostedToday: (user: BeRealUser) => boolean
  addPost: (opts: {
    dataUrl: string
    mimeType: string
    user: BeRealUser
  }) => Promise<void>
}

function normalizePost(raw: BeRealPost & { user?: string }): BeRealPost {
  if (raw.user === 'Lucas' || raw.user === 'Ava') return raw as BeRealPost
  return {
    ...raw,
    user: 'Lucas',
    id: `${raw.dateKey}_Lucas`,
  }
}

export function useBeReal(): UseBeRealResult {
  const [posts, setPosts] = useState<BeRealPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const today = todayKey()

  const refresh = useCallback(async () => {
    try {
      const next = await api.get<Array<BeRealPost & { user?: string }>>('/api/bereal')
      setPosts(next.map(normalizePost))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load BeReal')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const t = window.setInterval(() => void refresh(), POLL_MS)
    return () => window.clearInterval(t)
  }, [refresh])

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

  const getTodayPost = useCallback(
    (user: BeRealUser) => todayPosts.find((p) => p.user === user),
    [todayPosts],
  )

  const hasPostedToday = useCallback(
    (user: BeRealUser) => todayPosts.some((p) => p.user === user),
    [todayPosts],
  )

  const addPost = useCallback(
    async (opts: { dataUrl: string; mimeType: string; user: BeRealUser }) => {
      setPosting(true)
      setError(null)
      try {
        const post = await api.post<BeRealPost>('/api/bereal', {
          ...opts,
          dateKey: todayKey(),
        })
        setPosts((prev) => [...prev.filter((p) => p.id !== post.id), normalizePost(post)])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Post failed')
        throw err
      } finally {
        setPosting(false)
      }
    },
    [],
  )

  return {
    posts,
    todayPosts,
    historyDays,
    loading,
    error,
    posting,
    getTodayPost,
    hasPostedToday,
    addPost,
  }
}

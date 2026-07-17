import { useCallback, useEffect, useMemo, useState } from 'react'
import { todayKey } from '../lib/dates'
import { api } from '../lib/api'
import type { BeRealPost } from '../types'

const POLL_MS = 4000

interface UseBeRealResult {
  posts: BeRealPost[]
  todayPost: BeRealPost | undefined
  history: BeRealPost[]
  loading: boolean
  error: string | null
  posting: boolean
  hasPostedToday: boolean
  addPost: (opts: { dataUrl: string; mimeType: string }) => Promise<void>
}

export function useBeReal(): UseBeRealResult {
  const [posts, setPosts] = useState<BeRealPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const today = todayKey()

  const refresh = useCallback(async () => {
    try {
      const next = await api.get<BeRealPost[]>('/api/bereal')
      setPosts(next)
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

  const todayPost = useMemo(
    () => posts.find((p) => p.dateKey === today),
    [posts, today],
  )

  const history = useMemo(
    () =>
      posts
        .filter((p) => p.dateKey !== today)
        .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1)),
    [posts, today],
  )

  const addPost = useCallback(async (opts: { dataUrl: string; mimeType: string }) => {
    setPosting(true)
    setError(null)
    try {
      const post = await api.post<BeRealPost>('/api/bereal', {
        ...opts,
        dateKey: todayKey(),
      })
      setPosts((prev) => [...prev.filter((p) => p.id !== post.id), post])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Post failed')
      throw err
    } finally {
      setPosting(false)
    }
  }, [])

  return {
    posts,
    todayPost,
    history,
    loading,
    error,
    posting,
    hasPostedToday: Boolean(todayPost),
    addPost,
  }
}

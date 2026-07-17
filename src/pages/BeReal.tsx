import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { GlassCard } from '../components/GlassCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { resolveMediaUrl } from '../hooks/useGallery'
import { useBeReal } from '../hooks/useBeReal'
import { berealLateBadge } from '../lib/dates'
import { pickBeRealSelfie } from '../lib/media'

export function BeReal() {
  const { history, loading, error, posting, hasPostedToday, todayPost, addPost } = useBeReal()
  const [localError, setLocalError] = useState<string | null>(null)

  const badge = useMemo(
    () => (todayPost ? berealLateBadge(todayPost.timestamp, todayPost.dateKey) : null),
    [todayPost],
  )

  const handlePost = async () => {
    setLocalError(null)
    try {
      const media = await pickBeRealSelfie()
      await addPost({
        dataUrl: media.dataUrl,
        mimeType: media.mimeType,
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'Cancelled') return
      setLocalError(err instanceof Error ? err.message : 'Could not post')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 pb-3 pt-6">
        <h1 className="font-display text-3xl text-white">BeReal</h1>
        <p className="mt-1 text-sm text-lavender/70">One real moment a day</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {loading && <LoadingSpinner label="Loading feed…" />}
        {(error || localError) && (
          <p className="mb-3 rounded-2xl bg-purple-deep/30 px-4 py-3 text-sm text-gold-soft">
            {localError || error}
          </p>
        )}

        {!loading && (
          <section className="mb-8">
            <h2 className="mb-3 px-1 text-sm tracking-wide text-lavender/80 uppercase">
              Today
            </h2>
            <GlassCard className="mx-auto max-w-sm overflow-hidden p-0">
              <div className="relative aspect-[3/4] bg-night-soft">
                {todayPost ? (
                  <img
                    src={resolveMediaUrl(todayPost)}
                    alt="Today's BeReal"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
                    <Camera className="h-6 w-6 text-lavender/40" />
                    <p className="text-xs text-white/40">No post yet</p>
                  </div>
                )}
              </div>
              <div className="px-3 py-2">
                <p className="text-sm text-lavender">Ava & Lucas</p>
                {badge && <p className="text-[11px] text-gold-soft">{badge}</p>}
              </div>
            </GlassCard>

            {!hasPostedToday && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={posting}
                onClick={handlePost}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-deep py-3.5 font-medium text-white disabled:opacity-60"
              >
                <Camera className="h-5 w-5" />
                {posting ? 'Posting…' : 'Post today\'s BeReal'}
              </motion.button>
            )}
          </section>
        )}

        {!loading && (
          <section>
            <h2 className="mb-3 px-1 text-sm tracking-wide text-lavender/80 uppercase">
              History
            </h2>
            {history.length === 0 ? (
              <EmptyState message="Your history will bloom here ♡" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {history.map((post) => (
                  <GlassCard key={post.id} className="overflow-hidden p-0">
                    <img
                      src={resolveMediaUrl(post)}
                      alt={post.dateKey}
                      className="aspect-square w-full object-cover"
                    />
                    <p className="px-2 py-1.5 text-[11px] text-lavender/70">{post.dateKey}</p>
                  </GlassCard>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

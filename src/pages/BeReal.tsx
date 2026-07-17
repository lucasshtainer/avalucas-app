import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NAMES, type PartnerName } from '../config'
import { EmptyState } from '../components/EmptyState'
import { GlassCard } from '../components/GlassCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { resolveMediaUrl } from '../hooks/useGallery'
import { useBeReal } from '../hooks/useBeReal'
import { berealLateBadge } from '../lib/dates'
import { pickBeRealSelfie } from '../lib/media'
import type { BeRealPost } from '../types'

export function BeReal({ identity }: { identity: PartnerName }) {
  const {
    historyDays,
    loading,
    error,
    posting,
    hasPostedToday,
    getTodayPost,
    addPost,
  } = useBeReal()
  const [localError, setLocalError] = useState<string | null>(null)

  const mePosted = hasPostedToday(identity)
  const partner: PartnerName = identity === NAMES.left ? NAMES.right : NAMES.left
  const myPost = getTodayPost(identity)
  const partnerPost = getTodayPost(partner)

  const handlePost = async () => {
    setLocalError(null)
    try {
      const media = await pickBeRealSelfie()
      await addPost({
        dataUrl: media.dataUrl,
        mimeType: media.mimeType,
        user: identity,
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
            <div className="grid grid-cols-2 gap-3">
              <BeRealTile
                label={identity}
                post={myPost}
                locked={false}
                isYou
              />
              <BeRealTile
                label={partner}
                post={partnerPost}
                locked={!mePosted && Boolean(partnerPost)}
              />
            </div>

            {!mePosted && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={posting}
                onClick={handlePost}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-deep py-3.5 font-medium text-white disabled:opacity-60"
              >
                <Camera className="h-5 w-5" />
                {posting ? 'Posting…' : 'Post your BeReal'}
              </motion.button>
            )}
            {mePosted && !partnerPost && (
              <p className="mt-4 text-center text-sm text-lavender/60">
                Waiting for {partner}… ♡
              </p>
            )}
          </section>
        )}

        {!loading && (
          <section>
            <h2 className="mb-3 px-1 text-sm tracking-wide text-lavender/80 uppercase">
              History
            </h2>
            {historyDays.length === 0 ? (
              <EmptyState message="Your history will bloom here ♡" />
            ) : (
              <div className="space-y-3">
                {historyDays.map(({ dateKey, posts }) => (
                  <GlassCard key={dateKey} className="p-3">
                    <p className="mb-2 text-xs text-white/45">{dateKey}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[NAMES.left, NAMES.right].map((name) => {
                        const post = posts.find((p) => p.user === name)
                        return (
                          <div key={name} className="overflow-hidden rounded-xl bg-night/40">
                            {post ? (
                              <img
                                src={resolveMediaUrl(post)}
                                alt={name}
                                className="aspect-square w-full object-cover"
                              />
                            ) : (
                              <div className="flex aspect-square items-center justify-center text-xs text-white/30">
                                —
                              </div>
                            )}
                            <p className="px-2 py-1 text-[11px] text-lavender/70">{name}</p>
                          </div>
                        )
                      })}
                    </div>
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

function BeRealTile({
  label,
  post,
  locked,
  isYou = false,
}: {
  label: string
  post?: BeRealPost
  locked: boolean
  isYou?: boolean
}) {
  const badge = useMemo(
    () => (post ? berealLateBadge(post.timestamp, post.dateKey) : null),
    [post],
  )

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="relative aspect-[3/4] bg-night-soft">
        {post ? (
          <>
            <img
              src={resolveMediaUrl(post)}
              alt={label}
              className={`h-full w-full object-cover ${locked ? 'scale-105 blur-xl' : ''}`}
            />
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center bg-night/45 px-3 text-center">
                <p className="text-sm text-white">Post yours to see theirs 👀</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
            <Camera className="h-6 w-6 text-lavender/40" />
            <p className="text-xs text-white/40">
              {isYou ? 'No post yet' : 'Not yet'}
            </p>
          </div>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-sm text-lavender">{label}</p>
        {badge && !locked && <p className="text-[11px] text-gold-soft">{badge}</p>}
      </div>
    </GlassCard>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { GlassCard } from '../components/GlassCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { resolveMediaUrl, useGallery } from '../hooks/useGallery'
import { daysAgoLabel, formatMemoryDate, todayKey } from '../lib/dates'
import { hashString, pickIndexForDay } from '../lib/hash'
import type { GalleryItem } from '../types'

export function Memories() {
  const { items, loading, error } = useGallery()
  const [laneOpen, setLaneOpen] = useState(false)

  const todaysMemory = useMemo(() => {
    if (items.length === 0) return null
    const idx = pickIndexForDay(todayKey(), items.length)
    return items[idx]
  }, [items])

  const shuffled = useMemo(() => {
    if (!laneOpen) return []
    const copy = [...items]
    copy.sort((a, b) => {
      const ha = hashString(`${todayKey()}-${a.id}`)
      const hb = hashString(`${todayKey()}-${b.id}`)
      return ha - hb
    })
    return copy
  }, [items, laneOpen])

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 pb-3 pt-6">
        <h1 className="font-display text-3xl text-white">Memories</h1>
        <p className="mt-1 text-sm text-lavender/70">A daily echo of us</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {loading && <LoadingSpinner label="Finding a memory…" />}
        {error && (
          <p className="mb-3 rounded-2xl bg-purple-deep/30 px-4 py-3 text-sm text-gold-soft">
            {error}
          </p>
        )}

        {!loading && !todaysMemory && (
          <EmptyState message="Add photos to the Gallery to unlock memories ♡" />
        )}

        {!loading && todaysMemory && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-sm tracking-wide text-lavender/70 uppercase">
              Today&apos;s Memory
            </p>
            <GlassCard strong className="overflow-hidden p-0">
              {todaysMemory.type === 'video' ? (
                <video
                  src={resolveMediaUrl(todaysMemory)}
                  controls
                  playsInline
                  className="max-h-[52vh] w-full object-cover"
                />
              ) : (
                <img
                  src={resolveMediaUrl(todaysMemory)}
                  alt="Today's memory"
                  className="max-h-[52vh] w-full object-cover"
                />
              )}
              <div className="p-5">
                <p className="font-display text-xl text-lavender">
                  From {formatMemoryDate(todaysMemory.timestamp)} —{' '}
                  {daysAgoLabel(todaysMemory.timestamp)} ♡
                </p>
                <p className="mt-2 text-sm text-white/45">
                  Same memory for both of you, all day long.
                </p>
              </div>
            </GlassCard>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setLaneOpen(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-gold/35 bg-gold/10 py-3.5 text-gold-soft"
            >
              <Play className="h-4 w-4" />
              Memory Lane
            </motion.button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {laneOpen && <MemoryLane items={shuffled} onClose={() => setLaneOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

function MemoryLane({
  items,
  onClose,
}: {
  items: GalleryItem[]
  onClose: () => void
}) {
  const [index, setIndex] = useState(0)
  const item = items[index]

  useEffect(() => {
    if (items.length <= 1) return
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, 3200)
    return () => window.clearInterval(t)
  }, [items.length])

  if (!item) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-night">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2">
          <X />
        </button>
        <EmptyState message="No memories yet" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-night"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 rounded-full bg-night/50 p-2 text-white"
      >
        <X />
      </button>
      <div className="flex h-full items-center justify-center px-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-md"
          >
            {item.type === 'video' ? (
              <video
                src={resolveMediaUrl(item)}
                autoPlay
                muted
                playsInline
                className="max-h-[80vh] w-full rounded-2xl object-contain"
              />
            ) : (
              <img
                src={resolveMediaUrl(item)}
                alt=""
                className="max-h-[80vh] w-full rounded-2xl object-contain"
              />
            )}
            <p className="mt-4 text-center font-display text-lavender">
              {formatMemoryDate(item.timestamp)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

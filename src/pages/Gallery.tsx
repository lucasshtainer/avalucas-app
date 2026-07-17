import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { resolveMediaUrl, useGallery } from '../hooks/useGallery'
import { pickGalleryMedia } from '../lib/media'
import type { GalleryItem } from '../types'

export function Gallery() {
  const { grouped, items, loading, error, uploading, addMedia } = useGallery()
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [busyError, setBusyError] = useState<string | null>(null)

  const openItem = (item: GalleryItem) => {
    const idx = items.findIndex((i) => i.id === item.id)
    if (idx >= 0) setViewerIndex(idx)
  }

  const handleAdd = async () => {
    setBusyError(null)
    try {
      const media = await pickGalleryMedia()
      await addMedia({
        dataUrl: media.dataUrl,
        type: media.type,
        mimeType: media.mimeType,
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'Cancelled') return
      setBusyError(err instanceof Error ? err.message : 'Could not add media')
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      <header className="px-5 pb-3 pt-6">
        <h1 className="font-display text-3xl text-white">Gallery</h1>
        <p className="mt-1 text-sm text-lavender/70">Our photos & videos</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {loading && <LoadingSpinner label="Loading gallery…" />}
        {(error || busyError) && (
          <p className="mb-3 rounded-2xl bg-purple-deep/30 px-4 py-3 text-sm text-gold-soft">
            {busyError || error}
          </p>
        )}
        {!loading && items.length === 0 && (
          <EmptyState message="Nothing here yet… capture a moment ♡" />
        )}
        {!loading &&
          grouped.map((group) => (
            <section key={group.label} className="mb-6">
              <h2 className="mb-3 px-1 font-display text-lg text-lavender/90">{group.label}</h2>
              <div className="masonry">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item)}
                    className="block w-full overflow-hidden rounded-2xl border border-lavender/15"
                  >
                    {item.type === 'video' ? (
                      <video
                        src={resolveMediaUrl(item)}
                        className="w-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={resolveMediaUrl(item)}
                        alt=""
                        className="w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleAdd}
        disabled={uploading}
        className="fixed bottom-32 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-purple-deep shadow-lg shadow-purple-deep/40 disabled:opacity-60"
        aria-label="Add media"
      >
        <Plus className="h-7 w-7 text-white" />
      </motion.button>

      <AnimatePresence>
        {viewerIndex !== null && items[viewerIndex] && (
          <Viewer
            items={items}
            index={viewerIndex}
            onClose={() => setViewerIndex(null)}
            onIndex={setViewerIndex}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Viewer({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: GalleryItem[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const item = items[index]
  const src = resolveMediaUrl(item)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-night/95"
      onTouchStart={(e) => setTouchStart(e.changedTouches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStart == null) return
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart
        if (dx > 60 && index > 0) onIndex(index - 1)
        if (dx < -60 && index < items.length - 1) onIndex(index + 1)
        setTouchStart(null)
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <button type="button" onClick={onClose} className="rounded-full p-2 text-white/80">
          <X className="h-6 w-6" />
        </button>
        <p className="text-sm text-lavender/70">
          {index + 1} / {items.length}
        </p>
        <div className="w-10" />
      </div>
      <div className="relative flex flex-1 items-center justify-center px-2">
        <button
          type="button"
          className="absolute left-2 z-10 rounded-full bg-night/50 p-2 text-white/80 disabled:opacity-20"
          disabled={index <= 0}
          onClick={() => onIndex(index - 1)}
        >
          <ChevronLeft />
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="max-h-[75vh] max-w-full"
          >
            {item.type === 'video' ? (
              <video src={src} controls playsInline className="max-h-[75vh] max-w-full rounded-2xl" />
            ) : (
              <img src={src} alt="" className="max-h-[75vh] max-w-full rounded-2xl object-contain" />
            )}
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          className="absolute right-2 z-10 rounded-full bg-night/50 p-2 text-white/80 disabled:opacity-20"
          disabled={index >= items.length - 1}
          onClick={() => onIndex(index + 1)}
        >
          <ChevronRight />
        </button>
      </div>
      <p className="pb-8 text-center text-xs text-white/40">Swipe to browse</p>
    </motion.div>
  )
}

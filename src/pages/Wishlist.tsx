import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Heart, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { GlassCard } from '../components/GlassCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useWishlist } from '../hooks/useWishlist'
import { domainFromUrl, looksLikeUrl, normalizeUrl } from '../lib/media'
import type { WishlistItem } from '../types'

const EMOJI_PICKS = ['👗', '✨', '🎁', '🌙', '☕', '🎧', '🏠', '💐', '🧸', '✈️']

export function Wishlist() {
  const {
    sections,
    loading,
    error,
    itemsForSection,
    addSection,
    addItem,
    deleteItem,
    markGifted,
    toggleHeart,
  } = useWishlist()

  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? 'clothes')
  const [showAddSection, setShowAddSection] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [giftedOpen, setGiftedOpen] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [sectionEmoji, setSectionEmoji] = useState('✨')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [price, setPrice] = useState('')
  const [link, setLink] = useState('')

  const current = useMemo(() => {
    const id = sections.some((s) => s.id === activeSection)
      ? activeSection
      : sections[0]?.id
    return id ? itemsForSection(id) : { active: [], gifted: [] }
  }, [activeSection, itemsForSection, sections])

  const handleAddSection = async () => {
    if (!sectionName.trim()) return
    await addSection(sectionName.trim(), sectionEmoji)
    setSectionName('')
    setShowAddSection(false)
  }

  const handleAddItem = async () => {
    const sectionId = sections.some((s) => s.id === activeSection)
      ? activeSection
      : sections[0]?.id
    if (!sectionId) return

    const linkValue = link.trim()
    if (linkValue && looksLikeUrl(linkValue)) {
      const url = normalizeUrl(linkValue)
      await addItem({
        sectionId,
        type: 'link',
        title: title.trim() || domainFromUrl(url),
        note: note.trim() || undefined,
        price: price.trim() || undefined,
        url,
      })
    } else if (title.trim()) {
      await addItem({
        sectionId,
        type: 'text',
        title: title.trim(),
        note: note.trim() || undefined,
        price: price.trim() || undefined,
      })
    } else {
      return
    }

    setTitle('')
    setNote('')
    setPrice('')
    setLink('')
    setShowAddItem(false)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 pb-3 pt-6">
        <h1 className="font-display text-3xl text-white">Wishlist</h1>
        <p className="mt-1 text-sm text-lavender/70">Dreams, finds & soft spoiling</p>
      </header>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {sections.map((s) => {
          const active = s.id === activeSection
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`shrink-0 rounded-2xl px-3 py-2 text-sm ${
                active ? 'bg-purple-deep text-white' : 'glass text-lavender/80'
              }`}
            >
              <span className="mr-1">{s.emoji}</span>
              {s.name}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setShowAddSection(true)}
          className="glass flex shrink-0 items-center gap-1 rounded-2xl px-3 py-2 text-sm text-lavender"
        >
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {loading && <LoadingSpinner />}
        {error && (
          <p className="mb-3 rounded-2xl bg-purple-deep/30 px-4 py-3 text-sm text-gold-soft">
            {error}
          </p>
        )}

        {!loading && current.active.length === 0 && (
          <EmptyState message="Nothing here yet… dream big ♡" />
        )}

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {current.active.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onGifted={() => markGifted(item.id)}
                onDelete={() => deleteItem(item.id)}
                onHeart={() => toggleHeart(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {current.gifted.length > 0 && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setGiftedOpen((v) => !v)}
              className="mb-2 text-sm text-gold-soft"
            >
              Gifted 🎁 ({current.gifted.length}) {giftedOpen ? '▴' : '▾'}
            </button>
            <AnimatePresence>
              {giftedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {current.gifted.map((item) => (
                    <WishlistCard
                      key={item.id}
                      item={item}
                      gifted
                      onGifted={() => undefined}
                      onDelete={() => deleteItem(item.id)}
                      onHeart={() => toggleHeart(item.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowAddItem(true)}
        className="fixed bottom-32 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-purple-deep shadow-lg shadow-purple-deep/40"
        aria-label="Add wishlist item"
      >
        <Plus className="h-7 w-7 text-white" />
      </motion.button>

      <AnimatePresence>
        {showAddSection && (
          <Modal title="New section" onClose={() => setShowAddSection(false)}>
            <input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Section name"
              className="mb-3 w-full rounded-2xl border border-lavender/25 bg-night/50 px-4 py-3 outline-none"
            />
            <div className="mb-4 flex flex-wrap gap-2">
              {EMOJI_PICKS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setSectionEmoji(e)}
                  className={`rounded-xl px-2 py-1 text-xl ${
                    sectionEmoji === e ? 'bg-purple-deep' : 'bg-white/5'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddSection}
              className="w-full rounded-2xl bg-purple-deep py-3"
            >
              Create
            </button>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddItem && (
          <Modal title="Add to wishlist" onClose={() => setShowAddItem(false)}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="mb-2 w-full rounded-2xl border border-lavender/25 bg-night/50 px-4 py-3 outline-none"
            />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Paste a link (optional)"
              className="mb-2 w-full rounded-2xl border border-lavender/25 bg-night/50 px-4 py-3 outline-none"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="mb-2 w-full rounded-2xl border border-lavender/25 bg-night/50 px-4 py-3 outline-none"
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price (optional)"
              className="mb-4 w-full rounded-2xl border border-lavender/25 bg-night/50 px-4 py-3 outline-none"
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full rounded-2xl bg-purple-deep py-3"
            >
              Save
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function WishlistCard({
  item,
  gifted = false,
  onGifted,
  onDelete,
  onHeart,
}: {
  item: WishlistItem
  gifted?: boolean
  onGifted: () => void
  onDelete: () => void
  onHeart: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <GlassCard className={`p-4 ${gifted ? 'opacity-70' : ''}`}>
        {item.type === 'link' && item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="mb-2 block rounded-xl border border-lavender/20 bg-night/40 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-lavender/60">{domainFromUrl(item.url)}</p>
                <p className="mt-1 font-medium text-white">{item.title}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-lavender/60" />
            </div>
          </a>
        ) : (
          <p className="font-medium text-white">{item.title}</p>
        )}
        {item.note && <p className="mt-1 text-sm text-white/55">{item.note}</p>}
        {item.price && <p className="mt-1 text-sm text-gold-soft">{item.price}</p>}
        {item.hearted && <p className="mt-2 text-xs text-lavender/70">Saved with love ♡</p>}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onHeart}
            className={`rounded-xl px-3 py-2 text-sm ${item.hearted ? 'bg-purple-deep text-white' : 'bg-white/5 text-lavender'}`}
            aria-label="Heart"
          >
            <Heart className={`inline h-4 w-4 ${item.hearted ? 'fill-current' : ''}`} />
          </button>
          {!gifted && (
            <button
              type="button"
              onClick={onGifted}
              className="rounded-xl bg-white/5 px-3 py-2 text-sm text-gold-soft"
            >
              gifted 🎁
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto rounded-xl p-2 text-white/40"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-night/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-md rounded-2xl p-5"
      >
        <h3 className="mb-4 font-display text-xl">{title}</h3>
        {children}
      </motion.div>
    </motion.div>
  )
}

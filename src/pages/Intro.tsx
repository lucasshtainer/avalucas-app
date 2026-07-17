import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { INTRO_DURATION_MS } from '../config'
import { ParticleBackground } from '../components/ParticleBackground'
import { getDaysTogether } from '../lib/dates'

export function Intro({ onDone }: { onDone: () => void }) {
  const days = getDaysTogether()

  useEffect(() => {
    const t = window.setTimeout(onDone, INTRO_DURATION_MS)
    return () => window.clearTimeout(t)
  }, [onDone])

  return (
    <button
      type="button"
      onClick={onDone}
      className="purple-gradient relative flex h-full w-full flex-col items-center justify-center px-8 text-center"
    >
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="relative z-10"
      >
        <p className="mb-3 text-xs tracking-[0.35em] text-gold-soft/80 uppercase">
          Private
        </p>
        <h1 className="font-display text-5xl font-medium tracking-tight text-white sm:text-6xl">
          Ava & Lucas
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.9 }}
          className="mt-5 font-display text-xl text-lavender italic"
        >
          6 months of us ♡
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="mt-10"
        >
          <p className="text-sm text-white/50">Days together</p>
          <p className="mt-1 font-display text-5xl text-gold-soft tabular-nums">{days}</p>
        </motion.div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-10 text-xs text-lavender/70"
      >
        tap to continue
      </motion.p>
    </button>
  )
}

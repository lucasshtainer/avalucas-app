import { motion } from 'framer-motion'
import { PARTNER_NAMES, type PartnerName } from '../config'
import { GlassCard } from '../components/GlassCard'
import { ParticleBackground } from '../components/ParticleBackground'

export function Identity({ onPick }: { onPick: (name: PartnerName) => void }) {
  return (
    <div className="purple-gradient relative flex h-full w-full flex-col items-center justify-center px-6">
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <h1 className="mb-2 text-center font-display text-3xl">Who&apos;s this?</h1>
        <p className="mb-8 text-center text-sm text-lavender/75">
          So we know who&apos;s posting ♡
        </p>
        <div className="grid gap-3">
          {PARTNER_NAMES.map((name, i) => (
            <motion.button
              key={name}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => onPick(name)}
              className="w-full"
            >
              <GlassCard strong className="px-5 py-5 text-left transition hover:border-lavender/40">
                <p className="font-display text-2xl text-lavender">{name}</p>
                <p className="mt-1 text-xs text-white/45">Tap to continue as {name}</p>
              </GlassCard>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

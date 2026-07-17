import { motion } from 'framer-motion'

export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <motion.div
        className="h-9 w-9 rounded-full border-2 border-lavender/30 border-t-lavender"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm text-lavender/70">{label}</p>
    </div>
  )
}

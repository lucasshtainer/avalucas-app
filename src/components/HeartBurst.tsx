import { motion } from 'framer-motion'

const OFFSETS = [
  { x: 0, y: -40 },
  { x: 35, y: -20 },
  { x: -35, y: -20 },
  { x: 50, y: 10 },
  { x: -50, y: 10 },
  { x: 20, y: 35 },
  { x: -20, y: 35 },
  { x: 0, y: 20 },
]

export function HeartBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {OFFSETS.map((o, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl text-lavender"
          initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.2, 1.2, 0.6], x: o.x, y: o.y }}
          transition={{ duration: 0.9, delay: i * 0.03, ease: 'easeOut' }}
        >
          ♡
        </motion.span>
      ))}
    </div>
  )
}

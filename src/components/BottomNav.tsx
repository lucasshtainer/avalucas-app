import { Camera, Gift, Images, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { MainTab } from '../types'

const TABS: { id: MainTab; label: string; icon: typeof Images }[] = [
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'bereal', label: 'BeReal', icon: Camera },
  { id: 'wishlist', label: 'Wishlist', icon: Gift },
  { id: 'memories', label: 'Memories', icon: Sparkles },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: MainTab
  onChange: (tab: MainTab) => void
}) {
  return (
    <nav className="glass-strong safe-bottom fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t border-lavender/15 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      <ul className="grid grid-cols-4 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                className="relative flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px]"
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-2xl bg-purple-deep/40"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-5 w-5 ${isActive ? 'text-lavender' : 'text-white/45'}`}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                <span className={`relative z-10 ${isActive ? 'text-lavender' : 'text-white/45'}`}>
                  {tab.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

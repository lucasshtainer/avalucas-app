import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import {
  requestAndScheduleBeRealNotification,
  shouldAskNotifications,
} from '../lib/notifications'
import type { MainTab } from '../types'
import { BeReal } from './BeReal'
import { Gallery } from './Gallery'
import { Memories } from './Memories'
import { Wishlist } from './Wishlist'

export function MainApp() {
  const [tab, setTab] = useState<MainTab>('gallery')

  useEffect(() => {
    if (shouldAskNotifications()) {
      void requestAndScheduleBeRealNotification()
    }
  }, [])

  return (
    <div className="purple-gradient relative mx-auto flex h-full w-full max-w-md flex-col">
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="h-full"
          >
            {tab === 'gallery' && <Gallery />}
            {tab === 'bereal' && <BeReal />}
            {tab === 'wishlist' && <Wishlist />}
            {tab === 'memories' && <Memories />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

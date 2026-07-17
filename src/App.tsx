import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { LoadingSpinner } from './components/LoadingSpinner'
import { useAuth } from './hooks/useAuth'
import type { AppScreen } from './types'
import { Identity } from './pages/Identity'
import { Intro } from './pages/Intro'
import { Login } from './pages/Login'
import { MainApp } from './pages/MainApp'

export default function App() {
  const { ready, isAuthenticated, identity, login, setIdentity } = useAuth()
  const [introDone, setIntroDone] = useState(false)

  const finishIntro = useCallback(() => {
    setIntroDone(true)
  }, [])

  if (!ready) {
    return (
      <div className="purple-gradient flex h-full items-center justify-center">
        <LoadingSpinner label="Opening our world…" />
      </div>
    )
  }

  const activeScreen: AppScreen = !introDone
    ? 'intro'
    : !isAuthenticated
      ? 'login'
      : !identity
        ? 'identity'
        : 'main'

  return (
    <div className="mx-auto h-full max-w-md overflow-hidden bg-night text-white shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="h-full"
        >
          {activeScreen === 'intro' && <Intro onDone={finishIntro} />}
          {activeScreen === 'login' && <Login onLogin={login} />}
          {activeScreen === 'identity' && <Identity onPick={setIdentity} />}
          {activeScreen === 'main' && identity && <MainApp identity={identity} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

import { motion } from 'framer-motion'
import { useState } from 'react'
import { APP_PASSWORD } from '../config'
import { GlassCard } from '../components/GlassCard'
import { HeartBurst } from '../components/HeartBurst'
import { ParticleBackground } from '../components/ParticleBackground'

export function Login({
  onLogin,
}: {
  onLogin: (password: string) => boolean
  onSuccess?: () => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [burst, setBurst] = useState(false)
  const [locking, setLocking] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (locking) return

    if (password === APP_PASSWORD) {
      setError('')
      setBurst(true)
      setLocking(true)
      // Heart-burst celebration, then persist session
      window.setTimeout(() => {
        onLogin(password)
      }, 900)
      return
    }

    setError('Not quite… try again, love')
    setShake(true)
    window.setTimeout(() => setShake(false), 500)
  }

  return (
    <div className="purple-gradient relative flex h-full w-full flex-col items-center justify-center px-6">
      <ParticleBackground />
      {burst && <HeartBurst />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full max-w-sm"
      >
        <h1 className="mb-2 text-center font-display text-3xl text-white">Welcome back</h1>
        <p className="mb-8 text-center text-sm text-lavender/75">Our little world is locked ♡</p>

        <GlassCard strong className="p-6">
          <motion.form
            animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <label className="block text-sm text-lavender/80" htmlFor="secret">
              Enter our secret ♡
            </label>
            <input
              id="secret"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={locking}
              className="w-full rounded-2xl border border-lavender/25 bg-night/50 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-lavender/60 disabled:opacity-70"
            />
            {error && <p className="text-center text-sm text-gold-soft">{error}</p>}
            <button
              type="submit"
              disabled={locking}
              className="w-full rounded-2xl bg-purple-deep py-3 font-medium text-white transition hover:bg-purple-deep/90 active:scale-[0.98] disabled:opacity-70"
            >
              Open
            </button>
          </motion.form>
        </GlassCard>
      </motion.div>
    </div>
  )
}

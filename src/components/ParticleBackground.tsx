import { useMemo } from 'react'

const HEARTS = ['♡', '✦', '✧', '♥', '·']

export function ParticleBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: 10 + (i % 5) * 4,
        delay: (i % 8) * 0.45,
        duration: 6 + (i % 5),
        char: HEARTS[i % HEARTS.length],
        opacity: 0.2 + (i % 4) * 0.12,
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-lavender"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  )
}

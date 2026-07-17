export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function subscribeStorage(key: string, onChange: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === key || e.key === null) onChange()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

/** Simple deterministic string hash for same-day memory picks */
export function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i += 1) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function pickIndexForDay(dateKey: string, count: number): number {
  if (count <= 0) return 0
  return hashString(dateKey) % count
}

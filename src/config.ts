/**
 * All user-configurable values for Ava & Lucas live here.
 * Edit these before shipping ♡
 */

/** Relationship start date (YYYY-MM-DD) — set so the counter matches your real days together */
export const ANNIVERSARY_START_DATE = '2026-01-31'

/** Shared password gate — bundled into the app (not a loose .txt file) */
export const APP_PASSWORD = 'ava123'

/**
 * Daily BeReal notification time (24h clock, local timezone).
 * TODO: change if you want a different reminder hour.
 */
export const BEREAL_HOUR = 14
export const BEREAL_MINUTE = 0

/** Intro splash duration before auto-advancing (ms) */
export const INTRO_DURATION_MS = 3000

/** localStorage keys (session only — media lives on the Render /data disk) */
export const STORAGE_KEYS = {
  session: 'ava-lucas-session',
  notifAsked: 'ava-lucas-notif-asked',
} as const

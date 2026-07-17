/**
 * All user-configurable values for Ava & Lucas live here.
 * Edit these before shipping to her phone ♡
 */

/** Relationship start date (YYYY-MM-DD) — set so the counter matches your real days together */
export const ANNIVERSARY_START_DATE = '2026-01-31'

/** Shared password gate — bundled into the app (not a loose .txt file) */
export const APP_PASSWORD = 'ava123'

/** Partner display names */
export const NAMES = {
  left: 'Ava',
  right: 'Lucas',
} as const

export type PartnerName = (typeof NAMES)[keyof typeof NAMES]

export const PARTNER_NAMES: PartnerName[] = [NAMES.left, NAMES.right]

/**
 * Daily BeReal notification time (24h clock, local timezone).
 * TODO: change if you want a different reminder hour.
 */
export const BEREAL_HOUR = 14
export const BEREAL_MINUTE = 0

/** Intro splash duration before auto-advancing (ms) */
export const INTRO_DURATION_MS = 3000

/** localStorage keys */
export const STORAGE_KEYS = {
  session: 'ava-lucas-session',
  identity: 'ava-lucas-identity',
  localGallery: 'ava-lucas-gallery',
  localBeReal: 'ava-lucas-bereal',
  localWishlist: 'ava-lucas-wishlist',
  localSections: 'ava-lucas-wishlist-sections',
  notifAsked: 'ava-lucas-notif-asked',
} as const

# Ava & Lucas

A private couples app — Gallery, BeReal, Wishlist, and Memories — built as a 6-month anniversary gift.

Stack: **React + Vite + TypeScript**, **Express**, **Tailwind CSS**, **Capacitor**, **Framer Motion**.  
Photos, videos, and wishlist data are stored on disk under **`/data`** (Render persistent disk).

## Run locally

```bash
npm install
npm run dev
```

This starts the API (`:3001`, data in `./data`) and Vite (`:5173`, proxies `/api` + `/files`).

**Password:** `ava123` (change in `src/config.ts`)

## Configure the app

Edit `src/config.ts`:

| Constant | Purpose |
|----------|---------|
| `ANNIVERSARY_START_DATE` | Relationship start date (`YYYY-MM-DD`) |
| `APP_PASSWORD` | Shared login password |
| `BEREAL_HOUR` / `BEREAL_MINUTE` | Daily BeReal notification time (local) |

## Deploy on Render

Use a **Web Service** (not Static Site):

| Setting | Value |
|---------|--------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Disk mount path** | `/data` |

The server writes media to `/data/files` and JSON metadata to `/data/*.json`. Only files under `/data` persist across deploys.

Optional env var: `DATA_DIR` (defaults to `/data` on Render, `./data` locally).

## Build for iOS / Android (Capacitor)

Point the Capacitor app at your Render URL (or run the API yourself). Then:

```bash
npm run build
npx cap add ios      # once
npx cap add android # once
npx cap sync
```

### Notes

- **Camera / photos:** `@capacitor/camera` on device; browser uses a file-input fallback.
- **BeReal notifications:** `@capacitor/local-notifications` — native only.
- After native/web changes: `npm run build && npx cap sync`.

## Project layout

```
server/              # Express API + static file server (writes to /data)
src/
  config.ts          # passwords, dates, names, BeReal time
  components/        # shared UI
  pages/             # Intro, Login, Gallery, BeReal, Wishlist, Memories
  hooks/             # useAuth, useGallery, useBeReal, useWishlist
  lib/               # api client, dates, media, notifications
```

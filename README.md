# Ava & Lucas

A private couples app — Gallery, BeReal, Wishlist, and Memories — built as a 6-month anniversary gift.

Stack: **React + Vite + TypeScript**, **Tailwind CSS**, **Firebase** (Firestore + Storage), **Capacitor**, **Framer Motion**.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Use a 390px-wide viewport for the intended phone layout.

**Password:** `ava123` (change in `src/config.ts`)

Without Firebase configured, the app runs in **local mode** (data stays on that device via `localStorage`). Paste your Firebase config to sync between both phones.

## Configure the app

Edit `src/config.ts`:

| Constant | Purpose |
|----------|---------|
| `ANNIVERSARY_START_DATE` | Relationship start date (`YYYY-MM-DD`) for the days-together counter |
| `APP_PASSWORD` | Shared login password |
| `NAMES` | Partner display names |
| `BEREAL_HOUR` / `BEREAL_MINUTE` | Daily BeReal notification time (local) |

## Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore** and **Storage**.
3. For a private two-person app, start with open test rules (tighten later):

**Firestore rules (dev):**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Storage rules (dev):**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

4. Register a Web app and copy the config into `src/firebase.ts` (replace the `YOUR_*` placeholders).

Collections used:

- `gallery` — photos/videos metadata
- `bereal` — daily BeReal posts (`{date}_{User}` doc ids)
- `wishlist` — wishlist items
- `wishlistSections` — section chips (Clothes is created locally by default)

## Build for iOS / Android (Capacitor)

```bash
npm run build
npx cap add ios      # once
npx cap add android # once
npx cap sync
```

Then open the native project:

```bash
npx cap open ios
# or
npx cap open android
```

### Notes

- **Camera / photos:** `@capacitor/camera` on device; browser uses a file-input fallback.
- **BeReal notifications:** `@capacitor/local-notifications` schedules a daily reminder at the time in `src/config.ts`. Permission is requested on first launch after login. Notifications only fire on a real device/simulator with Capacitor, not in the desktop browser.
- After native plugin or web asset changes, re-run `npm run build && npx cap sync`.

## Project layout

```
src/
  config.ts          # passwords, dates, names, BeReal time
  firebase.ts        # Firebase config placeholder
  components/        # shared UI
  pages/             # Intro, Login, Gallery, BeReal, Wishlist, Memories
  hooks/             # useAuth, useGallery, useBeReal, useWishlist
  lib/               # dates, media, notifications, upload helpers
```

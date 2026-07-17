import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

/** Render disk mount, or ./data for local development */
const DATA_DIR = process.env.DATA_DIR || (fs.existsSync('/data') ? '/data' : path.join(ROOT, 'data'))
const FILES_DIR = path.join(DATA_DIR, 'files')
const META = {
  gallery: path.join(DATA_DIR, 'gallery.json'),
  bereal: path.join(DATA_DIR, 'bereal.json'),
  wishlist: path.join(DATA_DIR, 'wishlist.json'),
  sections: path.join(DATA_DIR, 'wishlist-sections.json'),
}

const DEFAULT_SECTIONS = [{ id: 'clothes', name: 'Clothes', emoji: '👗', order: 0 }]

function ensureDirs() {
  fs.mkdirSync(path.join(FILES_DIR, 'gallery'), { recursive: true })
  fs.mkdirSync(path.join(FILES_DIR, 'bereal'), { recursive: true })
  for (const file of Object.values(META)) {
    if (!fs.existsSync(file)) {
      const initial = file === META.sections ? DEFAULT_SECTIONS : []
      fs.writeFileSync(file, JSON.stringify(initial, null, 2))
    }
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return file === META.sections ? DEFAULT_SECTIONS : []
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function createId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function extFromMime(mimeType = '') {
  if (mimeType.includes('video')) return 'mp4'
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  return 'jpg'
}

function saveDataUrl(dataUrl, folder, mimeType) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl)
  if (!match) throw new Error('Invalid data URL')
  const mime = mimeType || match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const filename = `${createId('media')}.${extFromMime(mime)}`
  const rel = path.join(folder, filename)
  const abs = path.join(FILES_DIR, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, buffer)
  return { url: `/files/${folder}/${filename}`, mime }
}

ensureDirs()

const app = express()
app.use(express.json({ limit: '50mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, dataDir: DATA_DIR })
})

// ——— Gallery ———
app.get('/api/gallery', (_req, res) => {
  const items = readJson(META.gallery).sort((a, b) => b.timestamp - a.timestamp)
  res.json(items)
})

app.post('/api/gallery', (req, res) => {
  try {
    const { dataUrl, type, mimeType } = req.body || {}
    if (!dataUrl) {
      res.status(400).json({ error: 'dataUrl is required' })
      return
    }
    const { url } = saveDataUrl(dataUrl, 'gallery', mimeType)
    const item = {
      id: createId('gal'),
      url,
      type: type === 'video' ? 'video' : 'photo',
      timestamp: Date.now(),
    }
    const items = readJson(META.gallery)
    items.unshift(item)
    writeJson(META.gallery, items)
    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Upload failed' })
  }
})

app.delete('/api/gallery/:id', (req, res) => {
  const items = readJson(META.gallery)
  const item = items.find((i) => i.id === req.params.id)
  if (!item) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const next = items.filter((i) => i.id !== req.params.id)
  writeJson(META.gallery, next)
  if (item.url?.startsWith('/files/')) {
    const abs = path.join(FILES_DIR, item.url.replace(/^\/files\//, ''))
    fs.promises.unlink(abs).catch(() => undefined)
  }
  res.json({ ok: true })
})

// ——— BeReal ———
function normalizeBeRealPosts(posts) {
  let changed = false
  const next = posts.map((p) => {
    if (p.user === 'Lucas' || p.user === 'Ava') return p
    // Legacy single-slot posts become Lucas's
    changed = true
    return {
      ...p,
      user: 'Lucas',
      id: `${p.dateKey}_Lucas`,
    }
  })
  if (changed) writeJson(META.bereal, next)
  return next
}

app.get('/api/bereal', (_req, res) => {
  res.json(normalizeBeRealPosts(readJson(META.bereal)))
})

app.post('/api/bereal', (req, res) => {
  try {
    const { dataUrl, mimeType, dateKey, user } = req.body || {}
    if (!dataUrl || !dateKey || (user !== 'Lucas' && user !== 'Ava')) {
      res.status(400).json({ error: 'dataUrl, dateKey, and user (Lucas|Ava) are required' })
      return
    }
    const posts = normalizeBeRealPosts(readJson(META.bereal))
    if (posts.some((p) => p.dateKey === dateKey && p.user === user)) {
      res.status(409).json({ error: `${user} already posted today ♡` })
      return
    }
    const { url } = saveDataUrl(dataUrl, 'bereal', mimeType)
    const post = {
      id: `${dateKey}_${user}`,
      dateKey,
      user,
      url,
      timestamp: Date.now(),
    }
    posts.push(post)
    writeJson(META.bereal, posts)
    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Post failed' })
  }
})

// ——— Wishlist ———
app.get('/api/wishlist', (_req, res) => {
  let sections = readJson(META.sections)
  if (!Array.isArray(sections) || sections.length === 0) {
    sections = DEFAULT_SECTIONS
    writeJson(META.sections, sections)
  }
  res.json({
    sections: sections.sort((a, b) => a.order - b.order),
    items: readJson(META.wishlist),
  })
})

app.post('/api/wishlist/sections', (req, res) => {
  const { name, emoji } = req.body || {}
  if (!name?.trim()) {
    res.status(400).json({ error: 'name is required' })
    return
  }
  const sections = readJson(META.sections)
  const section = {
    id: createId('sec'),
    name: name.trim(),
    emoji: emoji || '✨',
    order: sections.length,
  }
  sections.push(section)
  writeJson(META.sections, sections)
  res.status(201).json(section)
})

app.post('/api/wishlist/items', (req, res) => {
  const partial = req.body || {}
  if (!partial.sectionId || !partial.title) {
    res.status(400).json({ error: 'sectionId and title are required' })
    return
  }
  const item = {
    ...partial,
    id: createId('wish'),
    createdAt: Date.now(),
    status: 'active',
    hearted: false,
  }
  const items = readJson(META.wishlist)
  items.unshift(item)
  writeJson(META.wishlist, items)
  res.status(201).json(item)
})

app.patch('/api/wishlist/items/:id', (req, res) => {
  const items = readJson(META.wishlist)
  const idx = items.findIndex((i) => i.id === req.params.id)
  if (idx < 0) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  items[idx] = { ...items[idx], ...req.body, id: items[idx].id }
  writeJson(META.wishlist, items)
  res.json(items[idx])
})

app.delete('/api/wishlist/items/:id', (req, res) => {
  const items = readJson(META.wishlist)
  writeJson(
    META.wishlist,
    items.filter((i) => i.id !== req.params.id),
  )
  res.json({ ok: true })
})

// Persistent media files
app.use('/files', express.static(FILES_DIR))

// Production: serve Vite build
const dist = path.join(ROOT, 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('/{*path}', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/files')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
}

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  console.log(`Ava & Lucas API listening on :${PORT}`)
  console.log(`Data directory: ${DATA_DIR}`)
})

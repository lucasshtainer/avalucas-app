import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
  type Photo,
} from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import type { MediaType } from '../types'

export interface PickedMedia {
  dataUrl: string
  type: MediaType
  mimeType: string
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function photoToDataUrl(photo: Photo): string {
  const mime = photo.format === 'png' ? 'image/png' : 'image/jpeg'
  if (photo.dataUrl) return photo.dataUrl
  if (photo.base64String) return `data:${mime};base64,${photo.base64String}`
  throw new Error('Camera returned no image data')
}

async function pickWithCapacitor(opts: {
  source: CameraSource
  direction?: CameraDirection
}): Promise<PickedMedia> {
  const photo = await Camera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: opts.source,
    direction: opts.direction ?? CameraDirection.Rear,
    width: 1600,
  })
  return {
    dataUrl: photoToDataUrl(photo),
    type: 'photo',
    mimeType: photo.format === 'png' ? 'image/png' : 'image/jpeg',
  }
}

function pickWithFileInput(accept: string, capture?: string): Promise<PickedMedia> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    if (capture) input.setAttribute('capture', capture)
    input.style.display = 'none'
    document.body.appendChild(input)

    const cleanup = () => {
      input.remove()
    }

    input.onchange = async () => {
      const file = input.files?.[0]
      cleanup()
      if (!file) {
        reject(new Error('No file selected'))
        return
      }
      try {
        const dataUrl = await fileToDataUrl(file)
        const type: MediaType = file.type.startsWith('video/') ? 'video' : 'photo'
        resolve({ dataUrl, type, mimeType: file.type || 'image/jpeg' })
      } catch (err) {
        reject(err)
      }
    }

    input.oncancel = () => {
      cleanup()
      reject(new Error('Cancelled'))
    }

    input.click()
  })
}

/** Gallery upload — camera roll / library, with web file-input fallback */
export async function pickGalleryMedia(): Promise<PickedMedia> {
  if (Capacitor.isNativePlatform()) {
    try {
      return await pickWithCapacitor({ source: CameraSource.Photos })
    } catch {
      // fall through to file input on native webview quirks
    }
  }
  return pickWithFileInput('image/*,video/*')
}

/** BeReal selfie — front camera preferred, web fallback with capture */
export async function pickBeRealSelfie(): Promise<PickedMedia> {
  if (Capacitor.isNativePlatform()) {
    try {
      return await pickWithCapacitor({
        source: CameraSource.Camera,
        direction: CameraDirection.Front,
      })
    } catch {
      // fall through
    }
  }
  return pickWithFileInput('image/*', 'user')
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function looksLikeUrl(value: string): boolean {
  try {
    const u = new URL(value.startsWith('http') ? value : `https://${value}`)
    return Boolean(u.hostname.includes('.'))
  } catch {
    return false
  }
}

export function normalizeUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

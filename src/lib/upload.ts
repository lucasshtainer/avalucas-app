import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { isFirebaseConfigured, storage } from '../firebase'
import { createId } from './id'
import { dataUrlToBlob } from './media'

/**
 * Uploads media to Firebase Storage when configured.
 * Otherwise returns the data URL for local persistence.
 */
export async function uploadMedia(
  dataUrl: string,
  folder: string,
  mimeType: string,
): Promise<string> {
  if (!isFirebaseConfigured() || !storage) {
    return dataUrl
  }

  const ext = mimeType.includes('video')
    ? 'mp4'
    : mimeType.includes('png')
      ? 'png'
      : 'jpg'
  const path = `${folder}/${createId('media')}.${ext}`
  const storageRef = ref(storage, path)
  const blob = dataUrlToBlob(dataUrl)
  await uploadBytes(storageRef, blob, { contentType: mimeType })
  return getDownloadURL(storageRef)
}

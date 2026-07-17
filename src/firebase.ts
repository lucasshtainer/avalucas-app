import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

/**
 * TODO: paste your Firebase config here from the Firebase Console
 * (Project settings → Your apps → Firebase SDK snippet)
 */
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID' &&
    Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
  )
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  storage = getStorage(app)
}

export { app, db, storage }

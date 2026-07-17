import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { BEREAL_HOUR, BEREAL_MINUTE, STORAGE_KEYS } from '../config'

const NOTIFICATION_ID = 260714

function nextTriggerDate(): Date {
  const now = new Date()
  const next = new Date()
  next.setHours(BEREAL_HOUR, BEREAL_MINUTE, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

export async function requestAndScheduleBeRealNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // Browser: mark as asked so we don't loop; real OS notifications need Capacitor
    localStorage.setItem(STORAGE_KEYS.notifAsked, '1')
    return
  }

  try {
    const perm = await LocalNotifications.requestPermissions()
    localStorage.setItem(STORAGE_KEYS.notifAsked, '1')
    if (perm.display !== 'granted') return

    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] })

    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title: 'Ava & Lucas',
          body: '⚡ Time to BeReal for each other!',
          schedule: {
            at: nextTriggerDate(),
            repeats: true,
            every: 'day',
          },
          sound: undefined,
          extra: { type: 'bereal' },
        },
      ],
    })
  } catch (err) {
    console.warn('Notification setup failed', err)
    localStorage.setItem(STORAGE_KEYS.notifAsked, '1')
  }
}

export function shouldAskNotifications(): boolean {
  return !localStorage.getItem(STORAGE_KEYS.notifAsked)
}

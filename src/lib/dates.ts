import {
  differenceInCalendarDays,
  format,
  formatDistanceStrict,
  parseISO,
  startOfDay,
} from 'date-fns'
import { ANNIVERSARY_START_DATE, BEREAL_HOUR, BEREAL_MINUTE } from '../config'

export function getStartDate(): Date {
  return parseISO(ANNIVERSARY_START_DATE)
}

export function getDaysTogether(now = new Date()): number {
  return Math.max(0, differenceInCalendarDays(startOfDay(now), startOfDay(getStartDate())))
}

export function todayKey(now = new Date()): string {
  return format(now, 'yyyy-MM-dd')
}

export function formatMonthYear(timestamp: number): string {
  return format(new Date(timestamp), 'MMMM yyyy')
}

export function formatMemoryDate(timestamp: number): string {
  return format(new Date(timestamp), 'MMMM do')
}

export function daysAgoLabel(timestamp: number, now = new Date()): string {
  const days = differenceInCalendarDays(startOfDay(now), startOfDay(new Date(timestamp)))
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function getBeRealDeadline(date = new Date()): Date {
  const d = new Date(date)
  d.setHours(BEREAL_HOUR, BEREAL_MINUTE, 0, 0)
  return d
}

export function berealLateBadge(postedAt: number, dateKey: string): string | null {
  const [y, m, day] = dateKey.split('-').map(Number)
  const deadline = new Date(y, m - 1, day, BEREAL_HOUR, BEREAL_MINUTE, 0, 0)
  if (postedAt <= deadline.getTime()) return null
  const late = formatDistanceStrict(postedAt, deadline, { roundingMethod: 'floor' })
  return `posted ${late} late`
}

export function formatRelativePosted(postedAt: number): string {
  return format(new Date(postedAt), 'h:mm a')
}

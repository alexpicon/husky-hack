import type { KitEvent } from '../../data/kit'
import { clock } from '../../ui/format'

export function need<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`Staff console: missing ${what}`)
  return value
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

export const shortDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/** Clock time, with the date added when the event is not on the reference day. */
export const when = (e: KitEvent, ref: KitEvent) =>
  sameDay(e.at, ref.at) ? clock(e.at) : `${shortDate(e.at)}, ${clock(e.at)}`

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

import { useCallback, useEffect, useState } from 'react'
import { WALL_CODE, type PanelEntry } from './results'

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const POLL_MS = 1500

export const newWallCode = (random = Math.random) =>
  Array.from({ length: 5 }, () => ALPHABET[Math.floor(random() * ALPHABET.length)]).join('')

/** The wall's code from a link, or null when it has none or a malformed one. */
export function readWallCode(search: string): string | null {
  const code = new URLSearchParams(search).get('wall')?.toUpperCase() ?? ''
  return WALL_CODE.test(code) ? code : null
}

/** A link to one of the panel pages. It never carries a session, so it can't touch the demo. */
export function panelLink(view: 'panel' | 'wall' | 'drill', code?: string) {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set('view', view)
  if (code) url.searchParams.set('wall', code)
  return url.toString()
}

export type Line = { quote: string; result: string; judge?: string }
export type Posted = { ok: true; entry: PanelEntry } | { ok: false; reason: 'busy' | 'full' | 'offline' }

export async function postToWall(code: string, line: Line): Promise<Posted> {
  try {
    const res = await fetch(`/api/panel?id=${code}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(line),
    })
    if (res.status === 429) {
      const { error } = (await res.json()) as { error?: string }
      return { ok: false, reason: error === 'full' ? 'full' : 'busy' }
    }
    if (!res.ok) return { ok: false, reason: 'offline' }
    return { ok: true, entry: ((await res.json()) as { entry: PanelEntry }).entry }
  } catch {
    return { ok: false, reason: 'offline' }
  }
}

export type WallStatus = 'connecting' | 'live' | 'offline'

const lastN = (entries: PanelEntry[]) => entries.at(-1)?.n ?? 0

/** The wall's lines, newest last, polled while the page is visible. */
export function useWallEntries(code: string) {
  const [entries, setEntries] = useState<PanelEntry[]>([])
  const [status, setStatus] = useState<WallStatus>('connecting')

  const refresh = useCallback(async () => {
    if (document.visibilityState === 'hidden') return
    try {
      const res = await fetch(`/api/panel?id=${code}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      const next = ((await res.json()) as { entries: PanelEntry[] }).entries
      // A slow reply from before a new line must not take that line back off the wall.
      setEntries((prev) => (!next.length || lastN(next) >= lastN(prev) ? next : prev))
      setStatus('live')
    } catch {
      setStatus('offline')
    }
  }, [code])

  useEffect(() => {
    void refresh()
    const timer = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  return { entries, status, refresh }
}

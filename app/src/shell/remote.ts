import { useSyncExternalStore } from 'react'

/**
 * Shared sessions over /api/session: every device that joins a code polls
 * the latest state and posts its own changes. Revisions come from the server,
 * so a slow reply can never move a device backwards.
 */
export type SessionStatus = 'off' | 'connecting' | 'live' | 'offline'

type Entry = { json: string; rev: number } | null
type Listener = (json: string) => void

const POLL_MS = 700
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const VALID = /^[A-Z0-9]{4,8}$/

const revs: Record<string, number> = {}
const pending: Record<string, number> = {}
const listeners = new Map<string, Set<Listener>>()
const announcers = new Set<() => void>()
const watchers = new Set<() => void>()

let id = readId()
let status: SessionStatus = id ? 'connecting' : 'off'
let snapshot: { id: string | null; status: SessionStatus } = { id, status }
let timer: ReturnType<typeof setInterval> | undefined

function readId() {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('session')?.toUpperCase() ?? ''
  return VALID.test(v) ? v : null
}

function notify() {
  snapshot = { id, status }
  watchers.forEach((w) => w())
}

function setStatus(s: SessionStatus) {
  if (s === status) return
  status = s
  notify()
}

function writeUrl() {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set('session', id)
  else url.searchParams.delete('session')
  window.history.replaceState(null, '', url)
}

async function poll() {
  if (!id || document.visibilityState === 'hidden') return
  const asked = id
  try {
    const res = await fetch(`/api/session?id=${asked}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(String(res.status))
    const state = (await res.json()) as Record<string, Entry>
    if (asked !== id) return
    setStatus('live')
    for (const [kind, entry] of Object.entries(state)) {
      const heard = listeners.get(kind)
      // A kind no store listens to yet stays unread, so a store that mounts later still gets it.
      if (!entry || !heard?.size || pending[kind] || entry.rev <= (revs[kind] ?? 0)) continue
      revs[kind] = entry.rev
      heard.forEach((l) => l(entry.json))
    }
  } catch {
    if (asked === id) setStatus('offline')
  }
}

function restartPolling() {
  if (timer) clearInterval(timer)
  timer = id ? setInterval(poll, POLL_MS) : undefined
  if (id) void poll()
}

export async function sendRemote(kind: string, json: string) {
  if (!id) return
  pending[kind] = (pending[kind] ?? 0) + 1
  try {
    const res = await fetch(`/api/session?id=${id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, json }),
    })
    if (!res.ok) throw new Error(String(res.status))
    const { rev } = (await res.json()) as { rev: number }
    revs[kind] = Math.max(revs[kind] ?? 0, rev)
    setStatus('live')
  } catch {
    setStatus('offline')
  } finally {
    pending[kind] -= 1
  }
}

export function subscribeRemote(kind: string, listener: Listener) {
  const heard = listeners.get(kind) ?? new Set<Listener>()
  listeners.set(kind, heard.add(listener))
  return () => void heard.delete(listener)
}

/** Called when this device starts a session, so it seeds the shared state. */
export function onAnnounce(announce: () => void) {
  announcers.add(announce)
  return () => void announcers.delete(announce)
}

export function startSession() {
  id = Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')
  Object.keys(revs).forEach((k) => delete revs[k])
  status = 'connecting'
  writeUrl()
  notify()
  announcers.forEach((a) => a())
  restartPolling()
}

export function joinSession(code: string) {
  const next = code.trim().toUpperCase()
  if (!VALID.test(next)) return false
  id = next
  Object.keys(revs).forEach((k) => delete revs[k])
  status = 'connecting'
  writeUrl()
  notify()
  restartPolling()
  return true
}

export function leaveSession() {
  id = null
  status = 'off'
  writeUrl()
  notify()
  restartPolling()
}

/** Link another device can open to join, optionally with a fixed view. */
export function sessionLink(view?: string) {
  const url = new URL(window.location.origin + window.location.pathname)
  if (id) url.searchParams.set('session', id)
  if (view) url.searchParams.set('view', view)
  return url.toString()
}

export function useSession() {
  return useSyncExternalStore(
    (cb) => {
      watchers.add(cb)
      return () => void watchers.delete(cb)
    },
    () => snapshot,
  )
}

if (id) restartPolling()

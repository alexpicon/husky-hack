import { Copy, MonitorPlay, Radio, RotateCcw, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { renderSVG } from 'uqr'
import { panelLink } from '../panel/wallClient'
import { useStory } from '../story/engine'
import { joinSession, leaveSession, sessionLink, startSession, useSession, type SessionStatus } from './remote'
import { useRun } from './run'

const DOT: Record<SessionStatus, string> = {
  off: 'bg-slate-300',
  connecting: 'bg-amber-400',
  live: 'bg-teal-500',
  offline: 'bg-rose-500',
}

/** The status in words, so the dot's color is never the only sign. */
const WORDS: Record<SessionStatus, string> = {
  off: '',
  connecting: 'Connecting to the session server',
  live: 'Synced about every second',
  offline: 'Cannot reach the session server',
}

function Qr({ text }: { text: string }) {
  const svg = useMemo(() => renderSVG(text, { pixelSize: 5, whiteColor: '#ffffff', blackColor: '#0b1220' }), [text])
  return <div className="size-[164px] [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
}

function CopyLink({ label, href }: { label: string; href: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(href).then(() => setCopied(true))
      }}
      className="flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-left text-xs ring-1 ring-line hover:bg-slate-100"
    >
      <span className="font-semibold">{label}</span>
      <span className="flex items-center gap-1 text-ink-3">
        <Copy size={12} /> {copied ? 'Copied' : 'Copy link'}
      </span>
    </button>
  )
}

/** Opens the panel wall in a new tab; with a session, the wall reuses its code. */
function PanelWallLink({ code, className }: { code?: string; className: string }) {
  return (
    <a
      href={panelLink('wall', code)}
      target="_blank"
      rel="noreferrer"
      title="Open the live panel wall that judges join from their phones"
      className={`flex items-center gap-1.5 rounded-lg font-semibold ${className}`}
    >
      <MonitorPlay size={12} aria-hidden /> Panel wall
    </a>
  )
}

/** Clears every story's answers in every window and laptop of the session, and starts this story over. */
function NewRun({ className }: { className: string }) {
  const { newRun } = useRun()
  const { goTo } = useStory()
  return (
    <button
      type="button"
      onClick={() => {
        newRun()
        goTo(0)
      }}
      title="Clear every answer from rehearsal, on every screen, and go back to step 1"
      className={`flex items-center gap-1.5 rounded-lg font-semibold ${className}`}
    >
      <RotateCcw size={12} aria-hidden /> New run
    </button>
  )
}

/** Start or join a shared session; once live, shows the code and a QR for the phone remote. */
export function SessionControl() {
  const { id, status } = useSession()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')

  if (!id) {
    return (
      <div className="flex items-center gap-1 rounded-xl bg-white p-1 text-xs ring-1 ring-line">
        <NewRun className="px-2 py-1.5 text-ink-3 hover:bg-slate-100 hover:text-ink-2" />
        <PanelWallLink className="px-2 py-1.5 text-ink-3 hover:bg-slate-100 hover:text-ink-2" />
        <span className="h-4 w-px bg-line" aria-hidden />
        <button
          type="button"
          onClick={() => {
            startSession()
            setOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold text-ink-2 hover:bg-slate-100"
        >
          <Radio size={13} /> Start session
        </button>
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault()
            if (joinSession(code)) setCode('')
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            maxLength={8}
            aria-label="Session code"
            className="w-16 rounded-lg bg-slate-50 px-2 py-1.5 font-mono text-xs uppercase ring-1 ring-line outline-none focus:ring-brand"
          />
          <button type="submit" className="rounded-lg px-2 py-1.5 font-semibold text-ink-2 hover:bg-slate-100">
            Join
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold ring-1 ring-line hover:bg-slate-50"
        aria-expanded={open}
      >
        <span className={`size-2 rounded-full ${DOT[status]}`} aria-hidden />
        Session <span className="font-mono tracking-wider">{id}</span>
        {status !== 'live' && <span className="font-medium text-ink-3">{status}</span>}
      </button>
      {open && (
        <div className="absolute top-11 right-0 z-40 w-[230px] rounded-2xl bg-white p-4 shadow-device ring-1 ring-line">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-3">Scan for the phone remote</span>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="text-ink-3">
              <X size={14} />
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            <Qr text={sessionLink('remote')} />
          </div>
          <div className="mt-1 text-center font-mono text-2xl font-semibold tracking-[0.3em]">{id}</div>
          <div className="mt-3 flex flex-col gap-1.5">
            <CopyLink label="Remote (phone)" href={sessionLink('remote')} />
            <CopyLink label="Member screen" href={sessionLink('member')} />
            <CopyLink label="Staff screen" href={sessionLink('staff')} />
            <PanelWallLink
              code={id}
              className="justify-center bg-slate-50 px-2.5 py-1.5 text-xs text-ink-2 ring-1 ring-line hover:bg-slate-100"
            />
          </div>
          <NewRun className="mt-3 w-full justify-center bg-slate-50 px-2.5 py-1.5 text-xs text-ink-2 ring-1 ring-line hover:bg-slate-100" />
          <div className="mt-3 flex items-center justify-between text-[11px] text-ink-3">
            <span>{WORDS[status]}</span>
            <button type="button" onClick={leaveSession} className="font-semibold text-danger">
              Leave
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

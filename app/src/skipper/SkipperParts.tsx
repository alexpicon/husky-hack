import { useEffect, useState, type ReactNode, type Ref } from 'react'
import { Lock, MessageCircle, Send, Square } from 'lucide-react'
import type { Look } from '../ui/look'
import { SOUND } from '../ui/soundApp'
import { skipperMode, type SkipperMode } from './client'
import { CONCEPT, privacyLine, SEND, SKIPPER_TITLE } from './copy'
import type { Suggestion } from './verify'

const isSound = (look: Look) => look === 'sound'
const accent = (look: Look) => (isSound(look) ? SOUND.link : 'var(--color-brand)')

/** The server's mode, keywords until it answers; the privacy line and every call use this one. */
export function useSkipperMode(): SkipperMode {
  const [mode, setMode] = useState<SkipperMode>('keywords')
  useEffect(() => {
    let live = true
    void skipperMode().then((m) => live && setMode(m))
    return () => {
      live = false
    }
  }, [])
  return mode
}

export function OpenButton({ look, label, onOpen }: { look: Look; label: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex min-h-11 w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-[15px] font-semibold transition active:scale-[0.99] ${isSound(look) ? 'bg-white shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'bg-white ring-1 ring-line hover:ring-slate-400'}`}
      style={{ color: isSound(look) ? SOUND.navy : undefined }}
    >
      <MessageCircle size={20} className="shrink-0" style={{ color: accent(look) }} aria-hidden />
      <span className="min-w-0 flex-1">{label}</span>
      <span className="text-[12px] font-medium opacity-60">Skipper</span>
    </button>
  )
}

export function ChatHeader({ look }: { look: Look }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <span className="text-[14px] font-bold" style={{ color: isSound(look) ? SOUND.navy : undefined }}>
        {SKIPPER_TITLE}
      </span>
      <span className="text-[12px] italic opacity-70">{CONCEPT}</span>
    </div>
  )
}

export function Bubble({ look, from, children }: { look: Look; from: 'skipper' | 'member'; children: ReactNode }) {
  if (from === 'member') {
    return (
      <p
        className="max-w-[85%] self-end rounded-2xl rounded-br-md px-3 py-2 text-[14px] leading-snug break-words whitespace-pre-wrap text-white"
        style={{ background: accent(look) }}
      >
        {children}
      </p>
    )
  }
  return (
    <div
      className={`max-w-[92%] self-start rounded-2xl rounded-bl-md px-3 py-2 text-[14px] leading-snug ${isSound(look) ? 'bg-[#f1f4f9]' : 'bg-slate-100 text-ink'}`}
    >
      {children}
    </div>
  )
}

/** A suggested tap, highlighted but not selected: only her "Yes" turns it on. */
export function SuggestedTap({ look, label, quote }: { look: Look; label: string; quote: Suggestion['quote'] }) {
  return (
    <li
      className="flex items-start gap-2 rounded-xl border-2 border-dashed bg-white px-2.5 py-1.5"
      style={{ borderColor: accent(look) }}
    >
      <Square size={16} className="mt-0.5 shrink-0 opacity-60" aria-hidden />
      <span className="min-w-0">
        <span className="block text-[14px] leading-tight font-semibold">{label}</span>
        <span className="block text-[13px] leading-snug italic opacity-75">{`“${quote}”`}</span>
      </span>
    </li>
  )
}

type ChoiceProps = { look: Look; yes: string; no: string; onYes: () => void; onNo: () => void }

export function Choice({ look, yes, no, onYes, onNo }: ChoiceProps) {
  const base = 'flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 text-[15px] font-semibold transition active:scale-[0.98]'
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onYes} className={`${base} text-white`} style={{ background: accent(look) }}>
        {yes}
      </button>
      <button
        type="button"
        onClick={onNo}
        className={`${base} border-2 bg-white`}
        style={{ borderColor: accent(look), color: accent(look) }}
      >
        {no}
      </button>
    </div>
  )
}

type ComposerProps = { look: Look; label: string; value: string; max: number; onChange: (v: string) => void; onSend: () => void }

/** Typing only: no microphone, since a silent check should never be said out loud. */
export function Composer({ look, label, value, max, onChange, onSend }: ComposerProps) {
  return (
    <div className="flex items-end gap-2">
      <textarea
        aria-label={label}
        rows={2}
        maxLength={max}
        value={value}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        className="min-h-11 flex-1 resize-none rounded-xl bg-white px-3 py-2 text-[15px] leading-snug ring-1 ring-slate-300 outline-none focus:ring-2"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={!value.trim()}
        aria-label={SEND}
        className="grid size-11 shrink-0 place-items-center rounded-xl text-white transition active:scale-[0.96] disabled:opacity-40"
        style={{ background: accent(look) }}
      >
        <Send size={18} aria-hidden />
      </button>
    </div>
  )
}

type PrivacyProps = { mode: SkipperMode; shares: boolean; ref?: Ref<HTMLParagraphElement> }

export function PrivacyLine({ mode, shares, ref }: PrivacyProps) {
  return (
    <p ref={ref} className="flex items-start gap-1.5 text-[12px] leading-snug opacity-75">
      <Lock size={12} className="mt-0.5 shrink-0" aria-hidden />
      {privacyLine(mode, shares)}
    </p>
  )
}

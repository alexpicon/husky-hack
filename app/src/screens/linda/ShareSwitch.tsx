import { Eye, EyeOff } from 'lucide-react'
import type { Look } from '../../ui/look'
import { SOUND } from '../../ui/soundApp'
import { caseActions, useLindaCase } from './lindaCase'

/** Her answers stay on the tablet unless she turns this on. Every new case starts with it off. */
export function ShareSwitch({ look }: { look: Look }) {
  const { state, update } = useLindaCase()
  if (state.taps.length === 0) return null
  const on = state.shared
  const sound = look === 'sound'
  const track = on ? (sound ? SOUND.link : 'var(--color-brand)') : '#c4c8d2'
  const Icon = on ? Eye : EyeOff
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => update((c) => caseActions.share(c, !on))}
      className={`flex shrink-0 items-center gap-2 rounded-xl px-1.5 py-1.5 text-left font-semibold transition ${sound ? 'text-[15px] hover:bg-white/70' : 'text-[15px] text-ink-2 hover:bg-slate-100'}`}
      style={sound ? { color: SOUND.text } : undefined}
    >
      <span
        className="relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors"
        style={{ background: track }}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${on ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
      <Icon size={16} className="shrink-0 opacity-70" aria-hidden />
      {on ? 'Shared with staff' : 'Share my answers with staff'}
    </button>
  )
}

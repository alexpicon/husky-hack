import { ArrowDownToLine, Check, Eye, EyeOff, Info, Landmark, TriangleAlert, Users } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { Look } from '../../ui/look'
import { Source } from '../../ui/primitives'
import { SOUND } from '../../ui/soundApp'
import { checkActions, romanceFit, ROMANCE_OPTIONS, type MichaelOption } from './check'
import { useMichaelCheck } from './checkState'
import { ROMANCE_LINE, TRUSTED_LINE, WITHDRAWAL_CHECK } from './facts'

const sound = (look: Look) => look === 'sound'

/** One fact from Sound's records, the first thing on the card, with the rows it comes from. */
export function FactLine({ look, ids, children }: { look: Look; ids: string[]; children: ReactNode }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-3 ${sound(look) ? 'bg-white shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'bg-brand-soft/70 ring-1 ring-indigo-100'}`}
    >
      <Info size={20} className="mt-0.5 shrink-0" style={{ color: sound(look) ? SOUND.navy : undefined }} aria-hidden />
      <p className="text-[15px] leading-snug">
        {children} <Source ids={ids} />
      </p>
    </div>
  )
}

function Option({ option, look }: { option: MichaelOption; look: Look }) {
  const { state, update } = useMichaelCheck()
  const on = state.taps.includes(option.id)
  const accent = sound(look) ? SOUND.link : 'var(--color-brand)'
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => update((c) => checkActions.tap(c, option.id))}
      className={`flex min-h-10 w-full items-center gap-2.5 rounded-xl border-2 px-2.5 py-1 text-left transition active:scale-[0.99] ${sound(look) ? 'shadow-[0_1px_6px_rgb(15_23_42/0.07)]' : 'ring-1 ring-line'}`}
      style={{ borderColor: on ? accent : 'transparent', background: on ? '#eaf2fc' : '#fff' }}
    >
      {on ? (
        <span className="grid size-5 shrink-0 place-items-center rounded-full text-white" style={{ background: accent }}>
          <Check size={13} strokeWidth={3} aria-hidden />
        </span>
      ) : (
        <option.icon size={20} className="shrink-0" style={{ color: sound(look) ? SOUND.navy : undefined }} aria-hidden />
      )}
      <span className="text-[14px] leading-tight font-semibold">{option.label}</span>
    </button>
  )
}

export function Options({ look }: { look: Look }) {
  return (
    <div className="flex flex-col gap-1.5" role="group" aria-label="Is any of this true?">
      {ROMANCE_OPTIONS.map((o) => (
        <Option key={o.id} option={o} look={look} />
      ))}
    </div>
  )
}

/**
 * His answers stay on his screen unless he turns this on. Every new check starts with it off. It
 * shows once he has tapped on the card, or once `answered` says he has answered on a later screen,
 * and stays while it is on, so he can always turn sharing off.
 */
export function ShareToggle({ look, answered }: { look: Look; answered?: boolean }) {
  const { state, update } = useMichaelCheck()
  if (!(answered ?? state.taps.length > 0) && !state.shared) return null
  const on = state.shared
  const Icon = on ? Eye : EyeOff
  const track = on ? (sound(look) ? SOUND.link : 'var(--color-brand)') : '#c4c8d2'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => update((c) => checkActions.share(c, !on))}
      className="flex items-center gap-2 self-start rounded-xl px-1 py-1 text-[14px] font-semibold transition hover:bg-black/5"
    >
      <span className="relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors" style={{ background: track }} aria-hidden>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
      <Icon size={16} className="shrink-0 opacity-70" aria-hidden />
      {on ? 'Shared with Sound staff' : 'Share my answers with Sound staff'}
    </button>
  )
}

function Line({ look, tone, icon, children }: { look: Look; tone: 'warn' | 'calm'; icon: ReactNode; children: ReactNode }) {
  const style =
    tone === 'warn'
      ? 'bg-warn-soft text-amber-900 ring-1 ring-amber-200'
      : sound(look)
        ? 'bg-white shadow-[0_2px_10px_rgb(15_23_42/0.07)]'
        : 'bg-slate-50 ring-1 ring-line'
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-[15px] leading-snug font-semibold ${style}`}
    >
      {icon}
      <span>{children}</span>
    </motion.p>
  )
}

/** What the card says back: the scam only on 2 or more fitting taps, and the trusted-person line to everyone. */
export function CheckResult({ look }: { look: Look }) {
  const { state } = useMichaelCheck()
  const fit = romanceFit(state.taps)
  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      {state.taps.includes('own') && (
        <Line look={look} tone="calm" icon={<Landmark size={18} className="mt-0.5 shrink-0" aria-hidden />}>
          Got it: this is your own account. We won't ask about this payee again.
        </Line>
      )}
      {fit && (
        <Line look={look} tone="warn" icon={<TriangleAlert size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden />}>
          {ROMANCE_LINE}
        </Line>
      )}
      <Line look={look} tone="calm" icon={<Users size={18} className="mt-0.5 shrink-0" aria-hidden />}>
        {TRUSTED_LINE}
      </Line>
    </div>
  )
}

/** What a withdrawal can't prove, on the card for everyone but a member paying his own account. */
export function WithdrawalCheck({ look }: { look: Look }) {
  const { state } = useMichaelCheck()
  if (state.taps.includes('own')) return null
  return (
    <section
      aria-label={WITHDRAWAL_CHECK.title}
      className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-3 ${sound(look) ? 'bg-white shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'bg-brand-soft/70 ring-1 ring-indigo-100'}`}
    >
      <ArrowDownToLine size={20} className="mt-0.5 shrink-0" style={{ color: sound(look) ? SOUND.navy : undefined }} aria-hidden />
      <div>
        <h3 className="text-[12px] font-bold tracking-wide uppercase" style={sound(look) ? { color: SOUND.navy } : undefined}>
          {WITHDRAWAL_CHECK.title}
        </h3>
        <p className="mt-0.5 text-[15px] leading-snug">{WITHDRAWAL_CHECK.body}</p>
      </div>
    </section>
  )
}

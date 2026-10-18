import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Banknote, Check, Info, Phone } from 'lucide-react'
import { useStory } from '../../story/engine'
import { useLook } from '../../ui/look'
import { Button, Source } from '../../ui/primitives'
import { SOUND, SoundButton, SoundCard } from '../../ui/soundApp'
import { NavyIcon } from '../linda/kiosk'
import { answerActions } from './answers'
import { useJamesAnswers } from './answersState'
import {
  AUTONOMY,
  CALL_AGENCY,
  checkReply,
  NONE,
  PRIVATE,
  SIGNALS,
  type JamesTap,
} from './copy'
import { daysAgo, jamesFacts } from './facts'
import { JamesTablet } from './kiosk'

type TileProps = { tap: JamesTap; on: boolean; sound: boolean; short?: boolean; onTap: () => void }

function Tile({ tap, on, sound, short = false, onTap }: TileProps) {
  const size = short ? 'h-12' : 'min-h-[52px] py-1.5'
  const look = sound
    ? 'rounded-[16px] border-2 shadow-[0_2px_10px_rgb(15_23_42/0.07)]'
    : `rounded-2xl ${on ? 'bg-brand text-white shadow-md ring-2 ring-brand' : 'bg-white text-ink ring-1 ring-slate-300 hover:ring-slate-400'}`
  const style = sound
    ? { borderColor: on ? SOUND.link : 'transparent', background: on ? '#eaf2fc' : '#fff' }
    : undefined
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onTap}
      className={`flex items-center gap-2.5 px-3 text-left transition active:scale-[0.99] ${size} ${look}`}
      style={style}
    >
      {sound && !on && <NavyIcon icon={tap.icon} size={22} />}
      {(!sound || on) && (
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full ${sound ? 'text-white' : on ? 'bg-white text-brand' : 'bg-slate-100 text-ink-2'}`}
          style={sound ? { background: SOUND.link } : undefined}
        >
          {on ? <Check size={15} strokeWidth={3} aria-hidden /> : <tap.icon size={15} aria-hidden />}
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="text-[14px] leading-tight font-semibold">{tap.label}</span>
        {tap.hint && (
          <span className={`text-xs leading-tight ${on && !sound ? 'text-white/80' : 'text-ink-3'}`}>{tap.hint}</span>
        )}
      </span>
    </button>
  )
}

/** A card in either look: the concept's tinted box or Sound's white card with a navy icon. */
function Note({ sound, tone, icon, children }: { sound: boolean; tone: 'warn' | 'brand'; icon: typeof Info; children: ReactNode }) {
  if (sound) {
    return (
      <SoundCard className="flex items-start gap-3 py-2.5">
        <NavyIcon icon={icon} size={22} />
        <div className="text-[14px] leading-snug">{children}</div>
      </SoundCard>
    )
  }
  const Icon = icon
  const ring = tone === 'warn' ? 'bg-warn-soft ring-amber-200' : 'bg-brand-soft ring-indigo-200'
  return (
    <div className={`flex gap-3 rounded-2xl px-4 py-2.5 ring-1 ring-inset ${ring}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${tone === 'warn' ? 'text-warn' : 'text-brand'}`} aria-hidden />
      <div className="text-[14px] leading-snug text-ink">{children}</div>
    </div>
  )
}

/** James's branch tablet: one true fact from Sound's records, then a silent check he taps privately. */
export function JamesCheck() {
  const sound = useLook() === 'sound'
  const f = jamesFacts()
  const { next } = useStory()
  const { state, update } = useJamesAnswers()
  const { taps } = state
  const reply = checkReply(taps)
  const tile = (t: JamesTap, short?: boolean) => (
    <Tile
      key={t.id}
      tap={t}
      on={taps.includes(t.id)}
      sound={sound}
      short={short}
      onTap={() => update((a) => answerActions.tap(a, t.id))}
    />
  )

  return (
    <JamesTablet caption="Branch tablet - James taps privately" icon={Banknote} status="Cash withdrawal">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Note sound={sound} tone="warn" icon={Info}>
          You asked us {daysAgo(f.call.at, f.cash.at)} <strong>{f.topic}</strong>. <Source ids={f.call.id} />
        </Note>
      </motion.div>
      <div>
        <h2
          className={sound ? 'text-[20px] leading-tight font-bold' : 'font-display text-[24px] leading-tight text-ink'}
          style={sound ? { color: SOUND.navy } : undefined}
        >
          Is any of this happening today?
        </h2>
        <p className="text-[14px] text-ink-2">Tap any that fit. You don't have to say it out loud.</p>
      </div>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="What is happening today">
        {SIGNALS.map((t) => tile(t))}
        {tile(NONE)}
      </div>
      <div className="grid grid-cols-[1fr_150px] gap-2">
        {tile(PRIVATE, true)}
        {sound ? (
          <SoundButton onClick={next}>
            Continue <ArrowRight size={18} aria-hidden />
          </SoundButton>
        ) : (
          <Button size="lg" onClick={next}>
            Continue <ArrowRight size={18} aria-hidden />
          </Button>
        )}
      </div>
      <div aria-live="polite">
        <Note sound={sound} tone="brand" icon={Phone}>
          {reply.said && <strong className="block">{reply.said}</strong>}
          {reply.agencies && <span className="block">{reply.agencies}</span>}
          <span className="block">
            <strong>{CALL_AGENCY}</strong> {AUTONOMY}
          </span>
        </Note>
      </div>
    </JamesTablet>
  )
}

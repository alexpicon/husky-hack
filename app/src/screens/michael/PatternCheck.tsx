import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { money } from '../../ui/format'
import { useLook, type Look } from '../../ui/look'
import { SOUND, SoundAppScreen, SoundButton } from '../../ui/soundApp'
import { AUTONOMY } from '../linda/copy'
import { AppBar } from '../m1039/parts'
import { useMichaelCheck } from './checkState'
import { michaelFacts, patternFact } from './facts'
import { CheckResult, FactLine, Options, ShareToggle } from './parts'

/** Michael decides: Send still works, and "Not now" sends nothing. */
function useDecision() {
  const { next } = useStory()
  const { state } = useMichaelCheck()
  const [waiting, setWaiting] = useState(false)
  return { own: state.taps.includes('own'), waiting, wait: () => setWaiting(true), send: next }
}

function Body({ look }: { look: Look }) {
  const f = michaelFacts()
  const sound = look === 'sound'
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <FactLine look={look} ids={f.run.map((e) => e.id)}>
          {patternFact(f)}
        </FactLine>
      </motion.div>
      <div>
        <h2 className="text-[19px] leading-tight font-bold" style={sound ? { color: SOUND.navy } : undefined}>
          Is any of this true?
        </h2>
        <p className={`text-[14px] ${sound ? '' : 'text-ink-3'}`} style={sound ? { color: SOUND.muted } : undefined}>
          Tap any that fit. Only you see your answers.
        </p>
      </div>
      <Options look={look} />
      <ShareToggle look={look} />
      <CheckResult look={look} />
    </>
  )
}

function Decided({ look }: { look: Look }) {
  return (
    <p
      role="status"
      className={`text-center text-[15px] font-semibold ${look === 'sound' ? '' : 'text-safe'}`}
      style={look === 'sound' ? { color: '#1f7a4d' } : undefined}
    >
      Nothing was sent. {AUTONOMY}
    </p>
  )
}

function PatternSound() {
  const { card } = michaelFacts()
  const d = useDecision()
  const send = (
    <SoundButton variant={d.own ? 'primary' : 'outline'} onClick={d.send}>
      Send {money(card.amount)} <ArrowRight size={18} aria-hidden />
    </SoundButton>
  )
  return (
    <SoundAppScreen title="Send Money" tab="move" back>
      <div className="flex flex-col gap-2.5">
        <div className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: SOUND.muted }}>
          Before you send {money(card.amount)}
        </div>
        <Body look="sound" />
        {d.waiting ? <Decided look="sound" /> : !d.own && <SoundButton onClick={d.wait}>Not now</SoundButton>}
        {send}
      </div>
    </SoundAppScreen>
  )
}

function PatternConcept() {
  const { card } = michaelFacts()
  const d = useDecision()
  const base = 'flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-semibold transition active:scale-[0.98]'
  const primary = `${base} bg-ink text-white shadow-float hover:bg-slate-800`
  const outline = `${base} bg-white text-ink ring-1 ring-line hover:bg-slate-50`
  return (
    <div className="flex min-h-full flex-col bg-white">
      <AppBar title="Send money" />
      <div className="flex flex-col gap-2.5 px-4 pb-5">
        <div className="text-[13px] font-semibold tracking-wide text-ink-3 uppercase">
          Before you send {money(card.amount)}
        </div>
        <Body look="concept" />
        {d.waiting ? (
          <Decided look="concept" />
        ) : (
          !d.own && (
            <button type="button" onClick={d.wait} className={primary}>
              Not now
            </button>
          )
        )}
        <button type="button" onClick={d.send} className={d.own ? primary : outline}>
          Send {money(card.amount)} <ArrowRight size={18} aria-hidden />
        </button>
      </div>
    </div>
  )
}

/** The pattern card before his 4th growing payment sends, with a romance silent check. */
export function PatternCheck() {
  return useLook() === 'sound' ? <PatternSound /> : <PatternConcept />
}

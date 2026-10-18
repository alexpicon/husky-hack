import { Ban, Hourglass, PhoneIncoming, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { clock, money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { Source } from '../../ui/primitives'
import { SOUND } from '../../ui/soundApp'
import { AUTONOMY } from '../linda/copy'
import { Browser } from './Browser'
import { checkActions, type WireChoice } from './check'
import { useMichaelCheck } from './checkState'
import { callLine, MICHAEL_NAME, michaelFacts, TRUSTED_LINE, wireFact } from './facts'
import { FactLine } from './parts'
import { WithdrawalTest } from './WithdrawalTest'

const CHOSEN: Record<WireChoice, string> = {
  wait: "We'll call you before the hold ends. After the call, you decide.",
  cancel: 'Cancelled. Nothing was sent, and the money stays in your account.',
}

/**
 * His first wire, held for a call from Sound, with the withdrawal question asked before the call. He
 * decides after the call; his answers reach staff (the test only if he shares) and step 3. Once he
 * cancels, nothing on the screen says the wire is held or that a call is coming.
 */
export function WireHold() {
  const look = useLook()
  const sound = look === 'sound'
  const f = michaelFacts()
  const { state, update } = useMichaelCheck()
  const choice = state.wire
  const cancelled = choice === 'cancel'
  const choose = (wire: WireChoice) => update((c) => checkActions.wire(c, wire))
  const until = clock(f.holdEnds)
  const card = sound ? 'bg-white shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'bg-slate-50 ring-1 ring-line'
  const button = 'h-11 flex-1 rounded-xl text-[15px] font-semibold transition active:scale-[0.98]'
  const primary = sound ? 'text-white' : 'bg-ink text-white hover:bg-slate-800'
  const outline = sound ? 'border-2 bg-white' : 'bg-white text-ink ring-1 ring-line hover:bg-slate-50'
  return (
    <Browser look={look} caption="Sound online banking: where Michael sent his wires in the kit">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] leading-tight font-bold" style={sound ? { color: SOUND.navy } : undefined}>
              {cancelled ? 'Your wire is cancelled' : 'Your wire is on hold'}
            </h2>
            <p className={`text-[14px] ${sound ? '' : 'text-ink-3'}`} style={sound ? { color: SOUND.muted } : undefined}>
              <span className="num font-semibold">{money(f.wire.amount)}</span> to a new account{' '}
              <Source ids={f.wire.id} />
            </p>
          </div>
          {cancelled ? (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-safe-soft px-3 py-1 text-[13px] font-semibold text-safe ring-1 ring-teal-200">
              <Ban size={14} aria-hidden /> Cancelled by {MICHAEL_NAME} · not sent
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1 text-[13px] font-semibold text-amber-900 ring-1 ring-amber-200">
              <Hourglass size={14} aria-hidden /> Held until {until}
            </span>
          )}
        </div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <FactLine look={look} ids={[f.wirePayeeAdded.id, f.cardPayeeAdded.id]}>
            {wireFact(f, state.card !== 'not-now')}
          </FactLine>
        </motion.div>
        <WithdrawalTest look={look} />
        <div className={`grid gap-3 ${cancelled ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {!cancelled && (
            <p className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-[14px] leading-snug ${card}`}>
              <PhoneIncoming size={18} className="mt-0.5 shrink-0" aria-hidden />
              <span>{callLine(f)}</span>
            </p>
          )}
          <p className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-[14px] leading-snug font-semibold ${card}`}>
            <Users size={18} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              {TRUSTED_LINE} {AUTONOMY}
            </span>
          </p>
        </div>
        {choice ? (
          <p role="status" className="text-[15px] font-semibold" style={{ color: '#1f7a4d' }}>
            {CHOSEN[choice]}
          </p>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => choose('wait')}
              className={`${button} ${primary}`}
              style={sound ? { background: `linear-gradient(180deg, #5b92c2, ${SOUND.action})` } : undefined}
            >
              Wait for Sound's call
            </button>
            <button
              type="button"
              onClick={() => choose('cancel')}
              className={`${button} ${outline}`}
              style={sound ? { borderColor: SOUND.action, color: SOUND.action } : undefined}
            >
              Cancel this wire
            </button>
          </div>
        )}
      </div>
    </Browser>
  )
}

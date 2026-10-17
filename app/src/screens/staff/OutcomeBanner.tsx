import { BadgeCheck, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { clock, day, money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { changeOf, type TakeoverFacts } from './takeoverFacts'

type Tile = { label: string; value: string }

export function OutcomeBanner({ f, stage }: { f: TakeoverFacts; stage: 'secured' | 'released' }) {
  const secured = stage === 'secured'
  const tiles: Tile[] = secured
    ? [
        { label: 'Payment', value: 'Stopped before send' },
        { label: 'Lost', value: '$0' },
        { label: 'Account', value: 'Locked' },
        { label: 'Case', value: 'Open' },
      ]
    : [
        { label: 'Paused', value: clock(f.hit.at) },
        { label: 'Member', value: 'Tapped YES' },
        { label: 'Payment', value: 'Released' },
        { label: 'Pause to release', value: 'Minutes' },
      ]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl bg-gradient-to-br from-teal-50 via-white to-white p-5 ring-1 ring-teal-200"
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-safe uppercase">
        {secured ? <ShieldCheck size={14} /> : <BadgeCheck size={14} />}
        Outcome
      </div>
      <div className="mt-1 font-display text-[34px] leading-tight tracking-tight text-ink">
        {secured
          ? `Stopped before send. ${f.name} lost nothing.`
          : 'Released after one tap.'}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 @xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-teal-100">
            <div className="text-[11px] font-medium text-ink-3">{t.label}</div>
            <div className="num mt-0.5 text-[15px] font-semibold text-safe">{t.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-2">
        {secured ? (
          <SecuredFootnote f={f} />
        ) : changeOf(f, 'phone') ? (
          'The member confirmed by calling the number on their card.'
        ) : (
          <>
            Their phone number never changed, so "Was this you?" went straight to it. The{' '}
            {f.hit.rail} payment of {money(f.hit.amount)} goes out the same day.{' '}
            <Source ids={f.hit.id} />
          </>
        )}
      </p>
    </motion.div>
  )
}

function SecuredFootnote({ f }: { f: TakeoverFacts }) {
  if (!f.reported) return <>Paused at {clock(f.hit.at)}, before any money left.</>
  return (
    <>
      In the kit, without Second Look: {money(f.dollarsSent)} was sent, nobody noticed until{' '}
      {day(f.reported.at)}, and {money(f.netLoss)} was lost. <Source ids={f.reported.id} />
    </>
  )
}

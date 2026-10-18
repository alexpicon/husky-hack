import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { isFollowUpTransfer, isGrowingPattern } from '../../data/michaelRules'
import { money } from '../../ui/format'
import { Card, Eyebrow, Source } from '../../ui/primitives'
import { useMichaelCheck } from './checkState'
import { kitCounts, michaelFacts } from './facts'

function Tile({ label, big, accent = false, children }: { label: string; big: string; accent?: boolean; children: ReactNode }) {
  return (
    <div className={`flex-1 rounded-2xl p-4 ring-1 ring-inset ${accent ? 'bg-safe-soft ring-teal-100' : 'bg-slate-50 ring-line'}`}>
      <div className={`min-h-8 text-[12px] leading-4 font-semibold ${accent ? 'text-safe' : 'text-ink-3'}`}>{label}</div>
      <div className="num mt-1 text-[26px] leading-none font-semibold tracking-tight text-ink">{big}</div>
      <div className="mt-2 text-[13px] leading-snug text-ink-2">{children}</div>
    </div>
  )
}

/**
 * What he lost in the kit, and where the card would have come: before most of it, never as money
 * saved. If he cancelled the held wire in this run, it says that wire never left.
 */
export function KitLine() {
  const f = michaelFacts()
  const card = kitCounts(isGrowingPattern)
  const hold = kitCounts(isFollowUpTransfer)
  const confirmed = f.warnings.filter((w) => w.memberResponse === 'Confirmed Intended').length
  const cancelled = useMichaelCheck().state.wire === 'cancel'
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-[364px]">
      <Card className="p-5">
        <Eyebrow>The honest cost</Eyebrow>
        <div className="mt-3 flex gap-2.5">
          <Tile label="In the kit, without Second Look" big={money(f.lost)}>
            Lost, after {confirmed} warnings he confirmed. <Source ids={f.warnings.map((w) => w.id)} />
          </Tile>
          <Tile accent label="With Second Look, the card appears before" big={money(f.fromCard)}>
            of it moves. {money(f.alreadySent)} was already gone. He decides; it is not money saved.
            {cancelled && ` Here he cancelled the ${money(f.wire.amount)} wire, so it never left his account.`}
          </Tile>
        </div>
        <p className="mt-4 border-t border-line pt-4 text-[14px] leading-snug text-ink-2">
          In the kit the card shows for{' '}
          <span className="num font-semibold text-ink">
            {card.romance?.flagged} of {card.romance?.total}
          </span>{' '}
          romance members and{' '}
          <span className="num font-semibold text-ink">
            {card.lookalike?.flagged} of {card.lookalike?.total}
          </span>{' '}
          honest look-alikes. Someone paying their own account taps "This is my own account" once and isn't
          asked again. The wire hold touches{' '}
          <span className="num font-semibold text-ink">
            {hold.honest.flagged} of {hold.honest.total}
          </span>{' '}
          honest members.
        </p>
      </Card>
    </motion.div>
  )
}

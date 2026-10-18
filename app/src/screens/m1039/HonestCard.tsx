import type { ReactNode } from 'react'
import { Phone, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { Card, Eyebrow, Source } from '../../ui/primitives'
import { clock } from '../../ui/format'
import { yesReleases } from '../staff/takeoverStages'
import { facts } from './facts'

type TileProps = { label: string; big: string; lines: ReactNode; accent?: boolean }

function Tile({ label, big, lines, accent = false }: TileProps) {
  return (
    <div
      className={`flex-1 rounded-2xl p-4 ring-1 ring-inset ${accent ? 'bg-safe-soft ring-teal-100' : 'bg-slate-50 ring-line'}`}
    >
      <div className={`min-h-8 text-[12px] leading-4 font-semibold ${accent ? 'text-safe' : 'text-ink-3'}`}>{label}</div>
      <div className="mt-1 text-[26px] leading-none font-semibold tracking-tight text-ink">{big}</div>
      <div className="mt-2 text-[13px] leading-snug text-ink-2">{lines}</div>
    </div>
  )
}

export function HonestCard() {
  const { payment, completed, lookalikes, honest } = facts
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-[364px]"
    >
      <Card className="p-5">
        <Eyebrow>The honest cost</Eyebrow>
        <div className="mt-3 flex gap-2.5">
          <Tile
            label="In the kit, without Second Look"
            big="0 taps"
            lines={
              <>
                <span className="num">
                  Sent {clock(payment.at)}, done {clock(completed.at)}
                </span>
                <span className="mt-1 block">
                  <Source ids={[payment.id, completed.id]} />
                </span>
              </>
            }
          />
          <Tile
            accent
            label="With Second Look"
            big="1 tap"
            lines={
              <>
                About a minute more.
                <span className="mt-1 block font-semibold text-safe">Released when they tap.</span>
              </>
            }
          />
        </div>

        <div className="mt-4 space-y-3 border-t border-line pt-4 text-[14px] leading-snug text-ink-2">
          <p className="flex gap-2.5">
            <Users size={16} className="mt-0.5 shrink-0 text-ink-3" />
            <span>
              The light check asks{' '}
              <span className="num font-semibold text-ink">
                {lookalikes.flagged} of {lookalikes.total}
              </span>{' '}
              honest <span className="whitespace-nowrap">look-alikes</span> for one tap: only their
              address changed.{' '}
              <span className="num font-semibold text-ink">
                {honest.untouched} of {honest.total}
              </span>{' '}
              honest members see nothing
              {honest.stopped === 0 ? ', and none gets the full stop.' : '.'}
            </span>
          </p>
          <p className="flex gap-2.5">
            <Phone size={16} className="mt-0.5 shrink-0 text-ink-3" />
            <span>
              Had their phone or email changed too, it would be a full stop,{' '}
              {yesReleases(true)
                ? 'released by a YES from the contact they had before.'
                : 'released only after a specialist calls the number they had before the change.'}
            </span>
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

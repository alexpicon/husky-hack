import { motion } from 'motion/react'
import { Ban, BellRing, Hand, UserRoundCheck, UserRoundX, type LucideIcon } from 'lucide-react'
import { clock } from '../../ui/format'
import { Card, Eyebrow, Source } from '../../ui/primitives'
import { lindaFacts } from './facts'

type Rule = { icon: LucideIcon; title: string; body: string }

export function TrustedRules() {
  const f = lindaFacts()
  const name = f.key.persona
  const rules: Rule[] = [
    { icon: Hand, title: 'Optional', body: `${name} decides whether to have one at all.` },
    {
      icon: UserRoundCheck,
      title: `Chosen by ${name}`,
      body: 'Set up ahead of time, at a branch or in the app.',
    },
    { icon: UserRoundX, title: 'Removable anytime', body: 'One tap, no questions asked.' },
    {
      icon: BellRing,
      title: 'Informed only',
      body: 'A request to call. Never amounts, never access.',
    },
    {
      icon: Ban,
      title: 'Skipped if they look involved',
      body: 'No message if they were just added, or if they are the new recipient.',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="w-[280px] p-6">
        <Eyebrow>Trusted person rules</Eyebrow>
        <ul className="mt-4 space-y-3.5">
          {rules.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon size={16} aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{title}</span>
                <span className="block text-[13px] leading-snug text-ink-2">{body}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-warn-soft p-3.5 ring-1 ring-amber-200 ring-inset">
          <div className="text-xs font-semibold text-warn">Why ahead of time</div>
          <p className="mt-1 text-[13px] leading-snug text-ink-2">
            Today the offer came mid-scam, at{' '}
            <span className="num font-mono">{clock(f.offered.at)}</span>, and {name} said no.
            Asked earlier, it's one quiet tap when it matters.
          </p>
          <div className="mt-1.5">
            <Source ids={f.offered.id} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

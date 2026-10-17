import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { Phone } from '../../ui/devices'
import { clock, money } from '../../ui/format'
import { Badge } from '../../ui/primitives'
import { sarah } from './facts'
import { Bubble, ThreadHeader } from './SoundChrome'

/** The real Sarah's phone: the number on file before tonight's change. */
export function SarahsPhone({
  at,
  caption = true,
  children,
}: {
  at: Date
  caption?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Badge tone="safe">The real Sarah</Badge>
      <Phone
        time={clock(at)}
        caption={
          caption
            ? `Sarah's phone - the number on file before ${clock(sarah.phoneChange.at)}`
            : undefined
        }
      >
        <div className="flex min-h-full flex-col bg-white">
          <ThreadHeader when={`Today ${clock(at)}`} />
          {children}
        </div>
      </Phone>
    </div>
  )
}

/** Sound's question, sent only to contact details that did not just change. */
export function AskMessages({ instant = false }: { instant?: boolean }) {
  const { paused } = sarah
  return (
    <>
      <Bubble instant={instant} delay={0.1}>
        Sound here. We paused a {money(paused.amount)} payment to a new recipient on your account
        at {clock(paused.at)}.
      </Bubble>
      <Bubble instant={instant} delay={0.45}>Was this you?</Bubble>
    </>
  )
}

export function NeverACode() {
  return (
    <p className="flex items-center justify-center gap-1.5 px-6 text-center text-[13px] font-medium text-ink-3">
      <Lock size={13} aria-hidden />
      Sound will never ask you for a code.
    </p>
  )
}

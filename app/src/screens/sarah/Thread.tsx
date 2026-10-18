import { useEffect, useRef, type ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { Phone } from '../../ui/devices'
import { clock, money } from '../../ui/format'
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

/**
 * Sound's text, sent only to contact details that did not just change. The facts go here,
 * to the real member, never to whoever is signed in.
 */
export function AskMessages({ instant = false }: { instant?: boolean }) {
  const { paused, reset, emailChange, phoneChange, recipientAdded } = sarah
  return (
    <>
      <Bubble instant={instant} delay={0.1}>
        Sound here. Tonight your password was reset at {clock(reset.at)}, and your email and
        phone number were changed at {clock(emailChange.at)} and {clock(phoneChange.at)}.
      </Bubble>
      <Bubble instant={instant} delay={0.4}>
        We paused a payment from your account at {clock(paused.at)}. Are you sending{' '}
        {money(paused.amount)} to a recipient added at {clock(recipientAdded.at)}?
      </Bubble>
      <Bubble instant={instant} delay={0.7}>
        If a website or caller told you to expect this text, tap No. Sound will never call you
        and ask you to tap Yes.
      </Bubble>
    </>
  )
}

export function NeverACode() {
  return (
    <p className="flex items-start justify-center gap-1.5 px-3 pt-1 text-center text-[13px] leading-snug font-medium text-ink-3">
      <Lock size={13} className="mt-0.5 shrink-0" aria-hidden />
      Sound will never call or text to ask for a code. If a website or caller asks for one, it's a
      scam.
    </p>
  )
}

/** Scrolls the phone's thread to its latest message, like a messages app does. */
export function ScrollToLatest({ after = 400 }: { after?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const id = window.setTimeout(() => {
      let el = ref.current?.parentElement ?? null
      while (el && getComputedStyle(el).overflowY !== 'auto') el = el.parentElement
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el?.scrollTo({ top: el.scrollHeight, behavior: still ? 'auto' : 'smooth' })
    }, after)
    return () => window.clearTimeout(id)
  }, [after])
  return <div ref={ref} aria-hidden />
}

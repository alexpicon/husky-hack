import { PhoneCall, Route } from 'lucide-react'
import { yesReleases, yesReply } from '../staff/takeoverStages'
import { afterPause } from './facts'
import { Bubble } from './SoundChrome'
import { AskMessages, SarahsPhone } from './Thread'

/** Her YES and Sound's answer to it, as POLICY.fullStopRelease sets it. */
export function YesReplies({ released, instant = false }: { released: boolean; instant?: boolean }) {
  const yesOk = yesReleases(true)
  return (
    <>
      <Bubble from="me" instant={instant}>
        Yes, it was me
      </Bubble>
      <Bubble instant={instant} delay={0.3}>
        {yesReply(yesOk)}
      </Bubble>
      {released && !yesOk && (
        <Bubble instant={instant} delay={0.3}>
          Thanks for confirming with our specialist. We've released the payment.
        </Bubble>
      )}
    </>
  )
}

/** The specialist's call to the number on file before the change, shown in the thread. */
export function CallLine() {
  return (
    <span className="my-1 flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-3">
      <PhoneCall size={13} aria-hidden /> Sound specialist called this number
    </span>
  )
}

/** Says this run's payment was released after a YES, since the story's later steps tell the NO. */
export function YesPathNote() {
  const how = yesReleases(true)
    ? 'Sarah tapped Yes, and a Yes on the number on file released the payment.'
    : "Sarah tapped Yes, and a specialist's callback confirmed it, so the payment was released."
  return (
    <div className="flex max-w-[360px] items-start gap-2.5 rounded-2xl bg-white px-4 py-3 text-sm leading-snug text-ink-2 ring-1 ring-line">
      <Route size={16} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
      <span>
        <span className="font-semibold text-ink">This run took the Yes path.</span> {how} This step
        tells the No path. Go back to step 1 to start a new run.
      </span>
    </div>
  )
}

/** Sarah's phone after the payment was released on her YES. */
export function YesPathPhone() {
  return (
    <div className="flex flex-col items-center gap-4">
      <SarahsPhone at={afterPause(1)}>
        <div className="flex flex-col gap-2 px-4 pt-4 pb-6">
          <AskMessages instant />
          <YesReplies released instant />
        </div>
      </SarahsPhone>
      <YesPathNote />
    </div>
  )
}

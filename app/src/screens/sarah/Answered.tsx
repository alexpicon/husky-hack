import { Hourglass, LockKeyhole, Send } from 'lucide-react'
import { IdleDevice } from '../../shell/Zone'
import { clock } from '../../ui/format'
import { TakeoverCase } from '../staff/TakeoverCase'
import { afterPause } from './facts'
import { NotMe } from './NotMe'
import { caseStage, released, replyActions, type ReplyStep } from './reply'
import { useSarahReply } from './replyState'
import { SarahReplySync } from './replyStore'
import { Secured } from './Secured'
import { YesPathNote, YesPathPhone } from './YesThread'

/** Sarah's real phone after the question: the No path, or the Yes path once her YES released the payment. */
export function SarahAfter({ step }: { step: 'not-me' | 'secured' }) {
  const { reply } = useSarahReply()
  let phone = step === 'not-me' ? <NotMe saidYes={reply.answer === 'yes'} /> : <Secured />
  if (released(reply)) phone = <YesPathPhone />
  return (
    <>
      <SarahReplySync />
      {phone}
    </>
  )
}

/** The scammer's screen: waiting while the payment is held, signed out once it is locked, paid if it was released. */
export function ScammerAfter({ step }: { step: ReplyStep }) {
  const { reply } = useSarahReply()
  const time = clock(afterPause(step === 'secured' ? 2 : 1))
  let screen = { line: 'Still waiting: payment pending review', icon: Hourglass }
  if (step === 'secured') screen = { line: 'Signed out: account locked', icon: LockKeyhole }
  if (released(reply)) screen = { line: 'Payment sent', icon: Send }
  return (
    <>
      <SarahReplySync />
      <IdleDevice time={time} line={screen.line} icon={screen.icon} />
    </>
  )
}

/** The staff case at each step after the question, from her reply. */
export function SarahCase({ step }: { step: ReplyStep }) {
  const { reply, update } = useSarahReply()
  return (
    <div className="flex flex-col gap-3">
      <SarahReplySync />
      {step !== 'asked' && released(reply) && <YesPathNote />}
      <TakeoverCase
        member="M1003"
        stage={caseStage(step, reply)}
        saidYesFirst={reply.answer === 'yes'}
        onCallbackDone={() => update(replyActions.callbackDone)}
      />
    </div>
  )
}

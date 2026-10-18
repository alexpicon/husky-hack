import { MessageSquare } from 'lucide-react'
import { SarahAfter, SarahCase, ScammerAfter } from '../screens/sarah/Answered'
import { Ask } from '../screens/sarah/Ask'
import { afterPause, sarah as facts, storyClock } from '../screens/sarah/facts'
import { Paused } from '../screens/sarah/Paused'
import { ResetSarahReply } from '../screens/sarah/replyStore'
import { SendMoney } from '../screens/sarah/SendMoney'
import { TakeoverCase } from '../screens/staff/TakeoverCase'
import { IdleDevice } from '../shell/Zone'
import { clock, money } from '../ui/format'
import type { Scenario } from './engine'
import { OPENINGS } from './openings'

const { paused, phoneChange, second, key, minutesResetToPause, minutesRecipientToPause } = facts

const noMessage = <IdleDevice time={clock(paused.at)} line="No message yet" icon={MessageSquare} />

export const sarah: Scenario = {
  id: 'sarah',
  label: 'Sarah',
  sublabel: 'Account takeover',
  tone: 'danger',
  zones: {
    attacker: { tone: 'attacker', label: "Scammer's device", who: 'Logged in as Sarah: the attacker' },
    member: {
      tone: 'member',
      label: "Sarah's real phone",
      who: `The number on file before ${clock(phoneChange.at)}`,
    },
    staff: { tone: 'staff', label: 'Sound staff', who: 'Sound Member Protection' },
  },
  steps: [
    {
      id: 'signals',
      title: `Someone is about to send ${money(paused.amount)} from Sarah's account`,
      opening: OPENINGS.sarah,
      caption: `${minutesResetToPause} minutes after a password reset, someone signed in as Sarah is paying a recipient added ${minutesRecipientToPause} minutes ago.`,
      clock: storyClock(paused.at),
      attacker: <SendMoney />,
      member: (
        <>
          <ResetSarahReply />
          {noMessage}
        </>
      ),
      staff: (
        <>
          <ResetSarahReply />
          <TakeoverCase member="M1003" stage="watching" />
        </>
      ),
    },
    {
      id: 'pause',
      title: 'Paused before it leaves',
      caption:
        `All three signals line up, so the payment pauses before it's sent. The screen says only "being reviewed". Facts go to the real member, never to whoever is logged in.`,
      clock: storyClock(paused.at),
      attacker: <Paused />,
      member: noMessage,
      staff: <TakeoverCase member="M1003" stage="paused" />,
    },
    {
      id: 'ask',
      title: 'Ask the real Sarah',
      caption: `Sound texts the facts and one question to the number it had before ${clock(phoneChange.at)}, never to the new one the scammer just added.`,
      clock: storyClock(afterPause(1)),
      attacker: <ScammerAfter step="asked" />,
      member: <Ask />,
      staff: <SarahCase step="asked" />,
    },
    {
      id: 'not-me',
      title: '"No, it wasn\'t me."',
      caption: 'Sarah\'s "No" keeps the payment stopped, and a specialist locks online access.',
      clock: storyClock(afterPause(1)),
      attacker: <ScammerAfter step="not-me" />,
      member: <SarahAfter step="not-me" />,
      staff: <SarahCase step="not-me" />,
    },
    {
      id: 'secured',
      title: `Stopped ${minutesResetToPause} minutes after the reset. $0 lost.`,
      caption: `In the kit, without Second Look, both payments went through and Sarah lost ${money(key.netLoss)}. With Second Look the first is stopped and the ${money(second.amount)} payment never happens.`,
      clock: storyClock(afterPause(2)),
      attacker: <ScammerAfter step="secured" />,
      member: <SarahAfter step="secured" />,
      staff: <SarahCase step="secured" />,
    },
  ],
}

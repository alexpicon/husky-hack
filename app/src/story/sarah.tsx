import { Ask } from '../screens/sarah/Ask'
import { afterPause, sarah as facts, storyClock } from '../screens/sarah/facts'
import { NotMe } from '../screens/sarah/NotMe'
import { Paused } from '../screens/sarah/Paused'
import { Secured } from '../screens/sarah/Secured'
import { SendMoney } from '../screens/sarah/SendMoney'
import { TakeoverCase } from '../screens/staff/TakeoverCase'
import { clock, money } from '../ui/format'
import type { Scenario } from './engine'

const { paused, phoneChange, second, key, minutesResetToPause, minutesRecipientToPause } = facts

export const sarah: Scenario = {
  id: 'sarah',
  label: 'Sarah',
  sublabel: 'Account takeover',
  tone: 'danger',
  steps: [
    {
      id: 'signals',
      title: `Someone is about to send ${money(paused.amount)} from Sarah's account`,
      caption: `${minutesResetToPause} minutes after a password reset, someone signed in as Sarah is paying a recipient added ${minutesRecipientToPause} minutes ago.`,
      clock: storyClock(paused.at),
      member: <SendMoney />,
      staff: <TakeoverCase member="M1003" stage="watching" />,
    },
    {
      id: 'pause',
      title: 'Paused before it leaves',
      caption:
        `All three signals line up, so the payment pauses before it's sent. The screen says only "being reviewed". Facts go to the real member, never to whoever is logged in.`,
      clock: storyClock(paused.at),
      member: <Paused />,
      staff: <TakeoverCase member="M1003" stage="paused" />,
    },
    {
      id: 'ask',
      title: 'Ask the real Sarah',
      caption: `Sound texts the facts and one question to the number it had before ${clock(phoneChange.at)}, never to the new one the scammer just added.`,
      clock: storyClock(afterPause(1)),
      member: <Ask />,
      staff: <TakeoverCase member="M1003" stage="asked" />,
    },
    {
      id: 'not-me',
      title: '"No, it wasn\'t me."',
      caption:
        'One tap from Sarah keeps the payment stopped, and a specialist locks online access.',
      clock: storyClock(afterPause(1)),
      member: <NotMe />,
      staff: <TakeoverCase member="M1003" stage="not-me" />,
    },
    {
      id: 'secured',
      title: `Stopped ${minutesResetToPause} minutes after the reset. $0 lost.`,
      caption: `Today both payments went through and Sarah lost ${money(key.netLoss)}. With Second Look the first is stopped and the ${money(second.amount)} payment never happens.`,
      clock: storyClock(afterPause(2)),
      member: <Secured />,
      staff: <TakeoverCase member="M1003" stage="secured" />,
    },
  ],
}

import { CheckScreen } from '../screens/m1039/CheckScreen'
import { facts } from '../screens/m1039/facts'
import { HonestCard } from '../screens/m1039/HonestCard'
import { MemberPhone } from '../screens/m1039/MemberPhone'
import { PayScreen } from '../screens/m1039/PayScreen'
import { ReleasedScreen } from '../screens/m1039/ReleasedScreen'
import { TapScreen } from '../screens/m1039/TapScreen'
import { TakeoverCase } from '../screens/staff/TakeoverCase'
import { clock, day, money } from '../ui/format'
import type { Scenario } from './engine'

const { payment, reset, address, tapAt, todayMinutes, lookalikes, honest } = facts
const paidAt = `${day(payment.at)} · ${clock(payment.at)}`
const tappedAt = `${day(tapAt)} · ${clock(tapAt)}`

export const m1039: Scenario = {
  id: 'm1039',
  label: 'M1039',
  sublabel: 'Real move, real rent',
  tone: 'safe',
  steps: [
    {
      id: 'signals',
      title: 'Same signals, honest member',
      caption: `Yesterday this member reset a forgotten password at ${clock(reset.at)} and updated their address after a move at ${clock(address.at)}. Now they pay ${money(payment.amount)} to a new landlord. When they press Send, the light check fires: only the address changed.`,
      clock: paidAt,
      member: (
        <MemberPhone time={clock(payment.at)} caption="Sound app: paying the new landlord">
          <PayScreen />
        </MemberPhone>
      ),
      staff: <TakeoverCase member="M1039" stage="watching" />,
    },
    {
      id: 'check',
      title: 'One quick check, not an alarm',
      caption:
        'Their email and phone never changed, so Sound asks on the phone they have had with us all along. No lock, no blame.',
      clock: paidAt,
      member: (
        <MemberPhone time={clock(payment.at)} caption="Sound app: a calm, one-step check">
          <CheckScreen />
        </MemberPhone>
      ),
      staff: <TakeoverCase member="M1039" stage="asked" />,
    },
    {
      id: 'tap',
      title: 'Was this you?',
      caption:
        'A text to the number Sound already trusts. No password, no code, no link. One tap answers it.',
      clock: tappedAt,
      member: (
        <MemberPhone time={clock(tapAt)} caption="Text from Sound to the unchanged phone" app={false}>
          <TapScreen />
        </MemberPhone>
      ),
      staff: <TakeoverCase member="M1039" stage="asked" />,
    },
    {
      id: 'released',
      title: 'One tap. Rent goes today.',
      caption: `In the kit, without Second Look, this payment went in ${todayMinutes} minutes with no check. With Second Look it is released when they tap. We add one tap for the ${lookalikes.flagged} movers; ${honest.untouched} of ${honest.total} honest members see nothing.`,
      clock: tappedAt,
      member: (
        <div className="flex flex-col items-center gap-5">
          <MemberPhone time={clock(tapAt)} caption="Sound app: payment on its way">
            <ReleasedScreen />
          </MemberPhone>
          <HonestCard />
        </div>
      ),
      staff: <TakeoverCase member="M1039" stage="released" />,
    },
  ],
}

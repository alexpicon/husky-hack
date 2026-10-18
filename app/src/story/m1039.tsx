import { readAnswer } from '../screens/m1039/answerState'
import { AnswerScope } from '../screens/m1039/answerStore'
import { CheckScreen } from '../screens/m1039/CheckScreen'
import { facts } from '../screens/m1039/facts'
import { M1039Case } from '../screens/m1039/M1039Case'
import { MemberPhone } from '../screens/m1039/MemberPhone'
import { Outcome } from '../screens/m1039/Outcome'
import { outcomeStep, tapCaption } from '../screens/m1039/outcomes'
import { PayScreen } from '../screens/m1039/PayScreen'
import { TapScreen } from '../screens/m1039/TapScreen'
import { TakeoverCase } from '../screens/staff/TakeoverCase'
import { clock, day, money } from '../ui/format'
import type { Scenario } from './engine'

const { payment, reset, address, tapAt } = facts
const paidAt = `${day(payment.at)} · ${clock(payment.at)}`
const tappedAt = `${day(tapAt)} · ${clock(tapAt)}`

/** The words on the last two steps follow M1039's answer, so they are read when the step is drawn. */
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
        <AnswerScope fresh>
          <MemberPhone time={clock(payment.at)} caption="Sound app: paying the new landlord">
            <PayScreen />
          </MemberPhone>
        </AnswerScope>
      ),
      staff: (
        <AnswerScope fresh>
          <TakeoverCase member="M1039" stage="watching" />
        </AnswerScope>
      ),
    },
    {
      id: 'check',
      title: 'One quick check, not an alarm',
      caption:
        'Their email and phone never changed, so Sound asks on the phone they have had with us all along. No lock, no blame.',
      clock: paidAt,
      member: (
        <AnswerScope>
          <MemberPhone time={clock(payment.at)} caption="Sound app: a calm, one-step check">
            <CheckScreen />
          </MemberPhone>
        </AnswerScope>
      ),
      staff: (
        <AnswerScope>
          <TakeoverCase member="M1039" stage="asked" />
        </AnswerScope>
      ),
    },
    {
      id: 'tap',
      title: 'Was this you?',
      get caption() {
        return tapCaption(readAnswer().answer)
      },
      clock: tappedAt,
      member: (
        <AnswerScope>
          <MemberPhone time={clock(tapAt)} caption="Text from Sound to the unchanged phone" app={false}>
            <TapScreen />
          </MemberPhone>
        </AnswerScope>
      ),
      staff: (
        <AnswerScope>
          <M1039Case unanswered="asked" />
        </AnswerScope>
      ),
    },
    {
      id: 'released',
      get title() {
        return outcomeStep(readAnswer().answer).title
      },
      get caption() {
        return outcomeStep(readAnswer().answer).caption
      },
      clock: tappedAt,
      member: (
        <AnswerScope>
          <Outcome />
        </AnswerScope>
      ),
      staff: (
        <AnswerScope>
          <M1039Case unanswered="released" />
        </AnswerScope>
      ),
    },
  ],
}

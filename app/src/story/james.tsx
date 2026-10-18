import { handedOver } from '../screens/james/answers'
import { readAnswers } from '../screens/james/answersState'
import { JamesSync, ResetJames } from '../screens/james/answersStore'
import { CallCard } from '../screens/james/CallCard'
import { JAMES_NAME, jamesFacts } from '../screens/james/facts'
import { JamesCheck } from '../screens/james/JamesCheck'
import { JamesOutcome } from '../screens/james/JamesOutcome'
import { dollars } from '../screens/linda/facts'
import { Stage } from '../screens/linda/parts'
import { TellerCall } from '../screens/staff/TellerCall'
import { TellerHeadsUp } from '../screens/staff/TellerHeadsUp'
import { TellerOutcome } from '../screens/staff/TellerOutcome'
import { clock, day } from '../ui/format'
import type { Scenario } from './engine'

const f = jamesFacts()
const at = (d: Date) => `${day(d)} · ${clock(d)}`
const amount = dollars(f.cash.amount)

export const james: Scenario = {
  id: 'james',
  label: 'James',
  sublabel: 'Gov’t impersonation',
  tone: 'warn',
  steps: [
    {
      id: 'call',
      memberLabel: 'What happened, from the kit',
      title: 'A call the day before',
      caption: `${JAMES_NAME} calls the contact center about the daily cash limit and how fast a wire arrives. Sound already keeps this record; Second Look connects it to tomorrow's branch visit.`,
      clock: at(f.call.at),
      member: (
        <Stage>
          <ResetJames />
          <JamesSync />
          <CallCard />
        </Stage>
      ),
      staff: (
        <>
          <ResetJames />
          <JamesSync />
          <TellerCall />
        </>
      ),
    },
    {
      id: 'teller',
      title: 'A heads-up for the teller, no hold',
      caption: `${JAMES_NAME} asks for ${amount} in cash. The teller sees yesterday's call and asks about the coaching, not the story: has anyone told him what to say? On the tablet, ${JAMES_NAME} can tap what is going on without saying it out loud. They decide together.`,
      clock: at(f.cash.at),
      member: (
        <Stage note="The call-back advice shows to everyone, whatever they tap.">
          <JamesSync />
          <JamesCheck />
        </Stage>
      ),
      staff: (
        <>
          <JamesSync />
          <TellerHeadsUp />
        </>
      ),
    },
    {
      id: 'outcome',
      // Getters, so the narration is read when the step renders and follows the teller's choice at step two.
      get title() {
        return handedOver(readAnswers())
          ? 'He goes ahead, and the cash is handed over'
          : 'He asks for help, and the cash stays'
      },
      get caption() {
        return handedOver(readAnswers())
          ? `${JAMES_NAME} goes ahead and the teller hands over the ${amount}. Cash can't be recalled; Sound opens a case and he can report it any time. The heads-up puts this question in front of every teller, every time.`
          : `${JAMES_NAME} asks for help. A specialist joins, he chooses to add a trusted contact, and he cancels the ${amount} withdrawal. The heads-up puts this question in front of every teller, every time.`
      },
      clock: at(f.opened.at),
      member: (
        <Stage>
          <JamesSync />
          <JamesOutcome />
        </Stage>
      ),
      staff: (
        <>
          <JamesSync />
          <TellerOutcome />
        </>
      ),
    },
  ],
  zones: {
    member: { tone: 'member', label: 'James: branch tablet', who: 'James, at the teller window' },
    staff: { tone: 'staff', label: 'Sound staff: teller', who: 'The teller serving James' },
  },
}

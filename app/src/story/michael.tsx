import { MichaelCheckSync, ResetMichaelCheck } from '../screens/michael/checkStore'
import { amounts, michaelFacts, ordinal } from '../screens/michael/facts'
import { KitLine } from '../screens/michael/KitLine'
import { PatternCheck } from '../screens/michael/PatternCheck'
import { ReportHome } from '../screens/michael/ReportHome'
import { WireHold } from '../screens/michael/WireHold'
import { MemberPhone } from '../screens/m1039/MemberPhone'
import { PatternCase } from '../screens/staff/PatternCase'
import { HOLD_HOURS, shortDate } from '../screens/linda/facts'
import { clock, day, money } from '../ui/format'
import type { Scenario } from './engine'

const f = michaelFacts()
const at = (d: Date) => `${day(d)} · ${clock(d)}`

export const michael: Scenario = {
  id: 'michael',
  label: 'Michael',
  sublabel: 'Romance scam',
  tone: 'danger',
  steps: [
    {
      id: 'pattern',
      title: 'Each payment bigger than the last',
      caption: `No single payment looks risky: ${amounts(f.run)} to someone he added on ${shortDate(f.cardPayeeAdded.at)}. Before the ${ordinal(f.run.length)} sends, Sound shows him the pattern and a silent check. Send still works. He decides.`,
      clock: at(f.card.at),
      member: (
        <>
          <ResetMichaelCheck />
          <MichaelCheckSync />
          <MemberPhone time={clock(f.card.at)} caption="Sound app: before the payment sends">
            <PatternCheck />
          </MemberPhone>
        </>
      ),
      staff: (
        <>
          <ResetMichaelCheck />
          <PatternCase stage="pattern" now={f.card.at} />
        </>
      ),
    },
    {
      id: 'wire',
      memberLabel: "Michael's computer: Sound online banking",
      title: 'His first wire ever, held for a call',
      caption: `${f.cardToWireDays} days later he wires ${money(f.wire.amount)} to a second new payee. After a pattern card, that is held up to ${HOLD_HOURS} hours for a call from Sound, with a script for romance scams. After the call, he decides.`,
      clock: at(f.wire.at),
      member: (
        <>
          <MichaelCheckSync />
          <WireHold />
        </>
      ),
      staff: <PatternCase stage="wire" now={f.wire.at} />,
    },
    {
      id: 'report',
      title: 'One tap when he knows',
      caption: `In the kit he reported it through the ${f.reported.channel.toLowerCase()} at ${clock(f.reported.at)}. With Second Look, "I think I've been scammed" is on every screen: one tap opens a case staff see at once. He lost ${money(f.lost)} in the kit; the card came before ${money(f.fromCard)} of it moved.`,
      clock: at(f.reported.at),
      member: (
        <div className="flex flex-col items-center gap-5">
          <MichaelCheckSync />
          <MemberPhone time={clock(f.reported.at)} caption="Sound app: the day he reports">
            <ReportHome />
          </MemberPhone>
          <KitLine />
        </div>
      ),
      staff: <PatternCase stage="report" now={f.reported.at} />,
    },
  ],
  zones: {
    member: { tone: 'member', label: "Michael's phone", who: 'Michael, in the Sound app' },
    staff: { tone: 'staff', label: 'Sound staff', who: 'Sound Member Protection' },
  },
}

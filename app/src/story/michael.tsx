import { MichaelCheckSync, ResetMichaelCheck } from '../screens/michael/checkStore'
import { amounts, dollars, honestLine, michaelFacts, ordinal } from '../screens/michael/facts'
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
  sublabel: 'Relationship investment scam',
  tone: 'danger',
  steps: [
    {
      id: 'pattern',
      title: 'Each payment bigger than the last',
      caption: `No single payment looks risky: ${amounts(f.run)} to someone he added on ${shortDate(f.cardPayeeAdded.at)}. Before the ${ordinal(f.run.length)} sends, Sound shows him the pattern, a silent check, and one check he can do himself: try taking $100 out of the platform. Send still works. He decides.`,
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
      caption: `${f.cardToWireDays} days later he wires ${money(f.wire.amount)} to a second new payee. After a pattern card, that is held up to ${HOLD_HOURS} hours for a call from Sound. Before the call he is asked if the withdrawal test worked, and the call opens with the same question. After the call, he decides.`,
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
      title: 'The case stays open: every wire gets a call',
      caption: `From the card, Michael has one open case. Every wire to the new account gets a call: ${amounts(f.wires)}. In the kit, ${dollars(f.wired)} of his ${money(f.sent)} moved after the turn to wires. ${honestLine(f)} When he knows, "I think I've been scammed" is on every screen.`,
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

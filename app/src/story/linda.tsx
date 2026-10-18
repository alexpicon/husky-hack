import { TrickedCase } from '../screens/staff/TrickedCase'
import { dollars, LINDA_NAME, lindaFacts, storyTimes } from '../screens/linda/facts'
import { Decide } from '../screens/linda/Decide'
import { ResetLindaCase } from '../screens/linda/LindaCaseProvider'
import { MatchResult } from '../screens/linda/MatchResult'
import { Stage } from '../screens/linda/parts'
import { SilentCheck } from '../screens/linda/SilentCheck'
import { TodayCard } from '../screens/linda/TodayCard'
import { TrustedPhone } from '../screens/linda/TrustedPhone'
import { TrustedRules } from '../screens/linda/TrustedRules'
import { clock, day } from '../ui/format'
import type { Scenario } from './engine'
import { OPENINGS } from './openings'

const f = lindaFacts()
const t = storyTimes()
const at = (d: Date) => `${day(d)} · ${clock(d)}`
const amount = dollars(f.wire.amount)
const illustrative = `Illustrative: if ${LINDA_NAME} had enrolled someone earlier. In the kit she had none and declined the offer at ${clock(f.offered.at)}.`

export const linda: Scenario = {
  id: 'linda',
  label: 'Linda',
  sublabel: 'Tricked member',
  tone: 'warn',
  steps: [
    {
      id: 'today',
      memberLabel: 'What happened, from the kit',
      title: 'Sound already tried. Secrecy won.',
      opening: OPENINGS.linda,
      caption: `Linda's ${amount} wire was held, a trusted contact was offered, and Sound called her. She had been told to keep it secret, so it went anyway.`,
      clock: at(t.caught),
      member: (
        <Stage>
          <ResetLindaCase />
          <TodayCard />
        </Stage>
      ),
      staff: (
        <>
          <ResetLindaCase />
          <TrickedCase member="M1001" stage="held" now={t.caught} />
        </>
      ),
    },
    {
      id: 'silent-check',
      title: 'A true fact, then a silent check',
      caption:
        'Sound shows one fact from its own records, then lets Linda tap what is going on. She never has to say it out loud.',
      clock: at(t.check),
      member: (
        <Stage>
          <SilentCheck />
        </Stage>
      ),
      staff: <TrickedCase member="M1001" stage="held" now={t.check} />,
    },
    {
      id: 'match',
      title: 'She checks the story herself',
      caption:
        'If some of her taps fit a known scam, she is shown how it works. Everyone is shown how to check the story on their own. The choice stays hers.',
      clock: at(t.match),
      member: (
        <Stage note="The call-back advice shows to everyone on hold, whatever they tap.">
          <MatchResult />
        </Stage>
      ),
      staff: <TrickedCase member="M1001" stage="checked" now={t.match} />,
    },
    {
      id: 'trusted',
      memberLabel: 'What her trusted person sees',
      title: 'One tap tells someone she trusts',
      caption:
        'If Linda picked a trusted person earlier, one tap asks them to call her. They never see an amount or her account.',
      clock: at(t.trusted),
      member: (
        <Stage label={illustrative}>
          <div className="flex items-start gap-6">
            <TrustedPhone />
            <TrustedRules />
          </div>
        </Stage>
      ),
      staff: <TrickedCase member="M1001" stage="checked" now={t.trusted} />,
    },
    {
      id: 'outcome',
      title: 'She decides, and it ends',
      caption:
        'She cancels, asks for help, or sends after talking to staff. If no one hears from her before the hold ends, the wire is not sent. Staff see the same case, and an ending is final.',
      clock: at(t.decide),
      member: (
        <Stage>
          <Decide at={t.decide} />
        </Stage>
      ),
      staff: <TrickedCase member="M1001" stage="checked" now={t.decide} />,
    },
  ],
}

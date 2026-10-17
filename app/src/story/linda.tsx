import { TrickedCase } from '../screens/staff/TrickedCase'
import { dollars, lindaFacts, storyTimes } from '../screens/linda/facts'
import { MatchResult } from '../screens/linda/MatchResult'
import { Stage } from '../screens/linda/parts'
import { SilentCheck } from '../screens/linda/SilentCheck'
import { TodayCard } from '../screens/linda/TodayCard'
import { TrustedPhone } from '../screens/linda/TrustedPhone'
import { TrustedRules } from '../screens/linda/TrustedRules'
import { clock, day } from '../ui/format'
import type { Scenario } from './engine'

const f = lindaFacts()
const t = storyTimes()
const at = (d: Date) => `${day(d)} · ${clock(d)}`
const amount = dollars(f.wire.amount)

export const linda: Scenario = {
  id: 'linda',
  label: 'Linda',
  sublabel: 'Tricked member · preview',
  tone: 'warn',
  steps: [
    {
      id: 'today',
      title: 'Sound already tried. Secrecy won.',
      caption: `Linda's ${amount} wire was held, a trusted contact was offered, and Sound called her. She had been told to keep it secret, so it went anyway.`,
      clock: at(t.caught),
      member: (
        <Stage>
          <TodayCard />
        </Stage>
      ),
      staff: <TrickedCase member="M1001" stage="held" />,
    },
    {
      id: 'silent-check',
      title: 'A true fact, then a silent check',
      caption:
        "Sound shows one fact from its own records, then lets Linda tap what is going on. She never has to say it out loud.",
      clock: at(t.check),
      member: (
        <Stage>
          <SilentCheck />
        </Stage>
      ),
      staff: <TrickedCase member="M1001" stage="held" />,
    },
    {
      id: 'match',
      title: 'She checks the story herself',
      caption:
        'Her taps match a known scam, so she is shown how it works and how to check it on her own. The choice stays hers.',
      clock: at(t.match),
      member: (
        <Stage note="Shown to everyone this hold applies to, whatever they tap.">
          <MatchResult />
        </Stage>
      ),
      staff: <TrickedCase member="M1001" stage="checked" />,
    },
    {
      id: 'trusted',
      title: 'One tap tells someone she trusts',
      caption:
        'If Linda picked a trusted person earlier, one tap asks them to call her. They never see an amount or her account.',
      clock: at(t.trusted),
      member: (
        <Stage>
          <div className="flex items-start gap-6">
            <TrustedPhone />
            <TrustedRules />
          </div>
        </Stage>
      ),
      staff: <TrickedCase member="M1001" stage="checked" />,
    },
  ],
}

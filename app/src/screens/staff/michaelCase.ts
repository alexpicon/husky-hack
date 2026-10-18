import { isFollowUpTransfer } from '../../data/michaelRules'
import { clock, money } from '../../ui/format'
import type { TimelineItem } from '../../ui/timeline'
import { staffView, TEST_OPTIONS, type MichaelCheck } from '../michael/check'
import { holdEndsFor, type MichaelFacts } from '../michael/facts'
import { shortDate } from './helpers'

const nth = (n: number) => `${n}${['st', 'nd', 'rd'][n - 1] ?? 'th'}`

/** His wires to the held account up to `now` that the follow-up rule holds for a call. */
export const heldWires = (f: MichaelFacts, now: Date) => f.wires.filter((e) => e.at <= now && isFollowUpTransfer(e))

/** What the 1st held wire came to in this run: his step-2 choice, and his test answer if he shared it. */
function firstWireDetail(f: MichaelFacts, c: MichaelCheck) {
  const outcome =
    c.wire === 'cancel'
      ? 'He cancelled it, so it was not sent.'
      : `Held until ${clock(f.holdEnds)} for a call. After the call he sent it, as in the kit. His decision.`
  const test = TEST_OPTIONS.find((o) => o.id === staffView(c).test)
  return test ? `${outcome} Withdrawal test, shared: "${test.label}".` : outcome
}

/**
 * One case from the pattern card to his report: every wire to the held account gets a call while
 * it is open. Rows come from the rules on his kit events up to `now`, with his choices carried in.
 */
export function caseTimeline(f: MichaelFacts, now: Date, c: MichaelCheck): TimelineItem[] {
  const card: TimelineItem = {
    time: shortDate(f.card.at),
    label: `Pattern card shown · ${money(f.card.amount)} ${f.card.rail}`,
    detail: c.card === 'not-now' ? 'No hold. He chose Not now, so it was not sent.' : 'No hold. He sent it.',
    tone: 'brand',
    source: f.card.id,
  }
  const wires = heldWires(f, now).map((e, i): TimelineItem => {
    const first = e === f.wire
    return {
      time: shortDate(e.at),
      label: `${nth(i + 1)} wire${first ? '' : ', same account'} · held for a call · ${money(e.amount)}`,
      detail: first ? firstWireDetail(f, c) : `Held until ${clock(holdEndsFor(e.at))} for a call. He decides.`,
      tone: first && c.wire === 'cancel' ? 'safe' : 'warn',
      source: e.id,
    }
  })
  const reported: TimelineItem = {
    time: shortDate(f.reported.at),
    label: 'In the kit: the platform blocks withdrawals, and he reports',
    detail: `${clock(f.reported.at)} · ${f.reported.channel}`,
    tone: 'danger',
    source: f.reported.id,
  }
  return [card, ...wires, ...(f.reported.at <= now ? [reported] : [])]
}

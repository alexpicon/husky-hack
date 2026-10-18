import { HEADS_UP_WINDOW_HOURS } from '../../data/jamesRules'
import { FOLLOW_UP_WINDOW_DAYS, PATTERN_MIN_RUN } from '../../data/michaelRules'
import { SESSION_WINDOW_HOURS } from '../../data/takeoverRules'
import { TRICKED_RATIO, TRICKED_SAME_DAY } from '../../data/trickedRules'
import { minutesBetween, money } from '../../ui/format'
import { JAMES_NAME, type JamesFacts } from '../james/facts'
import { dollars } from '../linda/facts'
import { MICHAEL_NAME, ordinal, type MichaelFacts } from '../michael/facts'
import { plural, shortDate } from './helpers'
import { heldWires } from './michaelCase'
import type { PatternStage } from './PatternCase'
import type { TakeoverFacts } from './takeoverFacts'
import type { TrickedFacts } from './trickedFacts'

/**
 * Why a staff case exists, in one sentence staff can read aloud to an examiner. Built only from
 * the rule that fired and kit events up to the story clock; never from the member's taps.
 */
export type Why = { label: string; line: string; ids: string[] }

/** "13 minutes", "26 hours" or "5 days": the unit a person would say aloud. */
export function gap(from: Date, to: Date): string {
  const minutes = minutesBetween(from, to)
  if (minutes < 120) return plural(minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  return hours < 72 ? plural(hours, 'hour') : plural(Math.floor(hours / 24), 'day')
}

const BASELINE = 'her 12-month 90th-percentile payment'

/** Linda's wire desk: the per-wire or same-day rule, whichever POLICY has on. */
export function whyTricked(f: TrickedFacts): Why {
  const wire = `the ${dollars(f.hit.amount)} wire`
  const size = TRICKED_SAME_DAY
    ? `${wire} brings today's wires to this account to ${f.ratio}x ${BASELINE}`
    : `${wire} is ${f.ratio}x ${BASELINE}`
  const lastWire =
    f.yearsSinceSameRail > 0 ? plural(f.yearsSinceSameRail, 'year') : plural(f.daysSinceSameRail, 'day')
  return {
    label: 'Why we paused',
    line: `Paused because ${size} (the rule's line is ${TRICKED_RATIO}x), goes to an account added ${gap(f.recipientAdded.at, f.hit.at)} earlier, and is her first wire in ${lastWire}.`,
    ids: [f.hit.id, f.recipientAdded.id],
  }
}

/** Sarah's full stop or M1039's light check, from the contact changes the rule counted. */
export function whyTakeover(f: TakeoverFacts): Why {
  const swapped = f.changes.filter((c) => c.kind !== 'address')
  const latest = f.changes[f.changes.length - 1].event
  const confirmation = f.changeConfirmed
    ? 'confirmed on the prior contact'
    : 'with no confirmation on the prior contact'
  const changed =
    swapped.length > 0
      ? `the ${[...new Set(swapped.map((c) => c.kind))].join(' and ')} changed in the ${gap(swapped[0].event.at, f.hit.at)} before it, ${confirmation}`
      : `only the address changed, ${gap(latest.at, f.hit.at)} before it`
  const session = f.session ? `, and the ${SESSION_WINDOW_HOURS}-hour rule fires too` : ''
  const lead = f.fullStop ? 'Paused because' : 'Paused for one tap because'
  return {
    label: 'Why we paused',
    line: `${lead} ${money(f.hit.amount)} is going to a recipient added ${gap(f.recipientAdded.at, f.hit.at)} earlier, ${gap(f.reset.at, f.hit.at)} after a password reset, and ${changed}${session}.`,
    ids: [f.hit.id, f.recipientAdded.id, f.reset.id, ...f.changes.map((c) => c.event.id)],
  }
}

/** Michael's card is advice, not a pause; his wires to the new account are paused for a call. */
export function whyPattern(f: MichaelFacts, stage: PatternStage, now: Date): Why {
  if (stage === 'pattern') {
    return {
      label: `Why ${MICHAEL_NAME} sees a card`,
      line: `No pause, only a card: ${dollars(f.card.amount)} would be the ${ordinal(f.run.length)} payment in ${plural(f.runDays, 'day')} to a payee added ${shortDate(f.cardPayeeAdded.at)}, each bigger than the last (the card starts at the ${ordinal(PATTERN_MIN_RUN)}), and Send still works.`,
      ids: f.run.map((e) => e.id),
    }
  }
  if (stage === 'wire') {
    const wire = f.firstWireEver ? 'wire, his first ever,' : 'wire'
    return {
      label: 'Why we paused',
      line: `Paused for a call because the ${dollars(f.wire.amount)} ${wire} goes to an account added ${gap(f.wirePayeeAdded.at, f.wire.at)} earlier, ${plural(f.cardToWireDays, 'day')} after a pattern card on a different payee (the rule's window is ${FOLLOW_UP_WINDOW_DAYS} days).`,
      ids: [f.wire.id, f.wirePayeeAdded.id, f.card.id],
    }
  }
  const held = heldWires(f, now)
  return {
    label: 'Why each wire is paused',
    line: `Each wire to the account added ${shortDate(f.wirePayeeAdded.at)} follows the pattern card within ${FOLLOW_UP_WINDOW_DAYS} days, so each is paused for a call: ${plural(held.length, 'wire')} so far.`,
    ids: held.map((e) => e.id),
  }
}

/** James's teller heads-up: a call, then cash or a wire. Nothing is held. */
export function whyHeadsUp(f: JamesFacts): Why {
  const what = f.cash.rail === 'Cash' ? 'cash withdrawal' : 'wire'
  return {
    label: 'Why the teller sees this',
    line: `No hold, only a heads-up: a ${dollars(f.cash.amount)} ${what} starts ${gap(f.call.at, f.cash.at)} after ${JAMES_NAME} called the contact center, inside the rule's ${HEADS_UP_WINDOW_HOURS} hours.`,
    ids: [f.call.id, f.cash.id],
  }
}

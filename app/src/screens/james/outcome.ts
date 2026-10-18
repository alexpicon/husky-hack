import { clock } from '../../ui/format'
import { dollars } from '../linda/facts'
import { jamesFacts } from './facts'

/** The kit's words for his answers, as a sentence. Anything else is shown as the kit says it. */
const ANSWERS: Record<string, string> = {
  'Requested Help': 'asked for help',
  'Accepted Offer': 'said yes',
}

export const answer = (response: string) => ANSWERS[response] ?? response.toLowerCase()

/** How James's afternoon ended, in the kit's order, each line from one kit event. */
export function endingLines() {
  const f = jamesFacts()
  return [
    { at: clock(f.confirm.at), you: `You ${answer(f.confirm.memberResponse)}`, id: f.confirm.id },
    { at: clock(f.escalated.at), you: 'A specialist joined you', id: f.escalated.id },
    { at: clock(f.enrolled.at), you: 'You chose to add a trusted contact', id: f.enrolled.id },
    {
      at: clock(f.cancelled.at),
      you: `You cancelled the withdrawal. The ${dollars(f.cash.amount)} stays in your account`,
      id: f.cancelled.id,
    },
    { at: clock(f.opened.at), you: `Sound opened case ${f.caseId} to help you`, id: f.opened.id },
  ]
}

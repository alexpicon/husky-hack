import { Building2, CirclePause, ShieldCheck, type LucideIcon } from 'lucide-react'
import { money } from '../../ui/format'
import type { TakeoverStage } from '../staff/TakeoverCase'
import { lostPhone } from './answers'
import type { M1039Answer } from './answerState'
import { facts, HOLD_HOURS } from './facts'

/** Every answer but Yes keeps the rent: nothing is sent. */
export type KeptAnswer = Exclude<M1039Answer, 'yes'>

/** The last step's app screen after an answer that keeps the rent. */
type Kept = { title: string; body: string; status: string; phone: string; icon: LucideIcon }

export const kept: Record<KeptAnswer, Kept> = {
  no: {
    title: 'Payment stopped',
    body: 'Payments to new recipients are held, and a Sound specialist will check your account and call you.',
    status: 'Stopped, not sent',
    phone: 'Sound app: payment stopped',
    icon: ShieldCheck,
  },
  'not-sure': {
    title: 'Still paused',
    body: 'Sound will call you at the number on file. Nothing is sent until you confirm.',
    status: 'Paused, not sent',
    phone: 'Sound app: payment still paused',
    icon: CirclePause,
  },
  'lost-phone': {
    title: lostPhone.title,
    body: 'Call the number on your card or visit any Sound branch with your ID. Nothing is sent meanwhile.',
    status: 'Paused, not sent',
    phone: 'Sound app: payment paused',
    icon: Building2,
  },
}

/** A step with no answer recorded tells the story's own path: the member taps Yes. */
export const shownAnswer = (answer: M1039Answer | null): M1039Answer => answer ?? 'yes'

type Words = { title: string; caption: string }

const { todayMinutes, lookalikes, honest, payment } = facts

/**
 * After Yes, and with no answer recorded, the script holds for every answer: the presenter's
 * phone remote, or a window that has just joined, may not have heard the answer yet.
 */
const outcomeWords: Record<M1039Answer, Words> = {
  yes: {
    title: 'One tap. Yes releases the rent.',
    caption: `In the kit, without Second Look, this payment went in ${todayMinutes} minutes with no check. With Second Look a Yes releases it when they tap, and any other answer sends nothing. We add one tap for the ${lookalikes.flagged} movers; ${honest.untouched} of ${honest.total} honest members see nothing.`,
  },
  no: {
    title: 'They tapped No. Nothing was sent.',
    caption: `The ${money(payment.amount)} stops before it is sent, and payments to new recipients stay held. Staff see the NO at once and can lock the account while a specialist checks it and calls the member.`,
  },
  'not-sure': {
    title: 'Not sure? It stays paused.',
    caption: `Nothing is sent. A specialist calls the number on file, and the rent goes only once the member confirms. With no answer in ${HOLD_HOURS} hours it isn't sent, and they can send it again.`,
  },
  'lost-phone': {
    title: 'A lost phone releases nothing.',
    caption:
      'They told the app they lost that phone, so no reply to the text can release this payment. Nothing is sent until they call the number on their card or visit a branch with ID.',
  },
}

/** The last step's headline and script, which follow the answer. */
export const outcomeStep = (answer: M1039Answer | null): Words => outcomeWords[shownAnswer(answer)]

/** The text step's script. After "I lost that phone", a reply on that phone no longer counts. */
export const tapCaption = (answer: M1039Answer | null) =>
  answer === 'lost-phone'
    ? 'They told the app they lost that phone, so a reply to this text can no longer release the payment. Sound closes the request and sends nothing.'
    : 'A text to the number Sound already trusts. No password, no code, no link. One tap answers it.'

/** What staff see once the member answers: released, a NO to act on, or still waiting on them. */
export function staffStage(answer: M1039Answer | null, locked: boolean, unanswered: TakeoverStage): TakeoverStage {
  if (answer === null) return unanswered
  if (answer === 'yes') return 'released'
  if (answer === 'no') return locked ? 'secured' : 'not-me'
  return 'asked'
}

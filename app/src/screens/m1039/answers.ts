import { HOLD_HOURS } from './facts'

export type TapAnswer = 'yes' | 'no' | 'not-sure'

/** What the member taps on the text, and Sound's reply. "Yes" also moves the story on to the release. */
export const tapReplies: Record<TapAnswer, { said: string; reply: string }> = {
  yes: {
    said: 'Yes, it was me',
    reply: "Thanks. We've released the payment for processing.",
  },
  no: {
    said: "No, it wasn't me",
    reply:
      "Thanks. This payment is stopped and won't be sent. New payees are on hold while a Sound specialist checks your account, and we'll call you at this number.",
  },
  'not-sure': {
    said: 'Not sure',
    reply:
      "That's OK. The payment stays paused and nothing is sent. A Sound specialist will call you at this number, the one on file, to go through it with you.",
  },
}

/** On the text after "I lost that phone" in the app: a reply here can no longer release it. */
export const closedOnText = "This request is closed, and nothing will be sent. You don't need to reply."

/** On the text, which only the phone on file receives. */
export const noAnswerOnText = `No answer within ${HOLD_HOURS} hours? It isn't sent. We'll text and call this number, and you can send it again.`

/** In the app, which whoever is signed in sees: it names no contact detail. */
export const noAnswerInApp = `No answer within ${HOLD_HOURS} hours? It isn't sent, and you can send it again.`

export const LOST_PHONE = 'I lost that phone'

/** In the app, after "I lost that phone". A new contact detail can't confirm this payment. */
export const lostPhone = {
  title: "We won't send it yet",
  body: 'Call the number on your card or visit any Sound branch with your ID, and we will confirm it with you there.',
}

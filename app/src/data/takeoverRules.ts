import type { KitEvent } from './kit'

export type TakeoverSignals = {
  passwordReset: boolean
  contactChange: boolean
  newRecipient: boolean
}

export function takeoverSignals(e: KitEvent): TakeoverSignals {
  return {
    passwordReset: e.passwordResetRecent,
    contactChange: e.profileChangeRecent,
    newRecipient: e.recipientStatus === 'New',
  }
}

export function isTakeover(e: KitEvent): boolean {
  const s = takeoverSignals(e)
  return e.type === 'Payment Initiated' && s.passwordReset && s.contactChange && s.newRecipient
}

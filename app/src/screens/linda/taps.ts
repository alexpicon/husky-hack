import {
  Ban,
  Gavel,
  House,
  Lock,
  MessageSquareQuote,
  Scale,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type TapId =
  | 'family'
  | 'official'
  | 'secret'
  | 'bail'
  | 'coached'
  | 'other'
  | 'none'
  | 'private'

/**
 * signal: how a scam often works. other and none: an answer that points to no scam.
 * request: asks for something, and is the one tap staff see without her sharing.
 */
export type TapKind = 'signal' | 'other' | 'none' | 'request'

export type TapOption = {
  id: TapId
  label: string
  short: string
  icon: LucideIcon
  kind: TapKind
  hint?: string
}

export const TAP_OPTIONS: TapOption[] = [
  {
    id: 'family',
    label: 'Someone called about a family member in trouble',
    short: 'Family member in trouble',
    icon: Users,
    kind: 'signal',
  },
  {
    id: 'official',
    label: 'A lawyer or official is involved',
    short: 'Lawyer involved',
    icon: Scale,
    kind: 'signal',
  },
  {
    id: 'secret',
    label: 'I was told to keep this secret',
    short: 'Told to keep it secret',
    icon: Lock,
    kind: 'signal',
  },
  {
    id: 'bail',
    label: "It's for bail or a fine",
    short: 'Bail or a fine',
    icon: Gavel,
    kind: 'signal',
  },
  {
    id: 'coached',
    label: 'Someone told me what to say to the bank',
    short: 'Told what to say',
    icon: MessageSquareQuote,
    kind: 'signal',
  },
  {
    id: 'other',
    label: 'Something else (e.g. buying a home)',
    short: 'Something else',
    icon: House,
    kind: 'other',
  },
  { id: 'none', label: 'None of these', short: 'None of these', icon: Ban, kind: 'none' },
  {
    id: 'private',
    label: "I'd rather talk privately",
    short: 'Talk privately',
    icon: UserRoundCheck,
    kind: 'request',
    hint: 'Staff will find you a private desk',
  },
]

const kindOf = (id: TapId) => TAP_OPTIONS.find((o) => o.id === id)?.kind

/**
 * Turns one tap on or off. "None of these" clears every answer and any answer clears it;
 * asking to talk privately goes with either. Taps keep the list's order in every window.
 */
export function toggleTap(taps: readonly TapId[], id: TapId): TapId[] {
  let on: TapId[]
  if (taps.includes(id)) on = taps.filter((t) => t !== id)
  else if (kindOf(id) === 'none') on = [...taps.filter((t) => kindOf(t) === 'request'), id]
  else if (kindOf(id) === 'request') on = [...taps, id]
  else on = [...taps.filter((t) => kindOf(t) !== 'none'), id]
  return TAP_OPTIONS.map((o) => o.id).filter((t) => on.includes(t))
}

/** The check's layout: answers in a grid, then "None of these" and the private request. */
export const CHECK_LAYOUT = {
  answers: TAP_OPTIONS.filter((o) => o.kind === 'signal' || o.kind === 'other'),
  none: TAP_OPTIONS.find((o) => o.kind === 'none')!,
  talk: TAP_OPTIONS.find((o) => o.kind === 'request')!,
}

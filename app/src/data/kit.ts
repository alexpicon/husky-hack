import eventsCsv from '@kit/HuskyHack_Synthetic_Events_v2.csv?raw'
import keyCsv from '@kit/HuskyHack_Member_Key_v2.csv?raw'
import { parseCsv, type Row } from './csv'

export type KitEvent = {
  id: string
  member: string
  at: Date
  category: string
  type: string
  channel: string
  paymentId: string
  rail: string
  amount: number
  recipientId: string
  recipientStatus: string
  recipientAgeDays: number | null
  daysSinceLastSameRail: number | null
  baselineRatio: number | null
  profileChangeRecent: boolean
  passwordResetRecent: boolean
  paymentStatus: string
  memberResponse: string
  note: string
}

export type MemberKey = {
  member: string
  persona: string
  scenario: string
  subtype: string
  lookalike: boolean
  summary: string
  outcome: string
  scamPaymentIds: string[]
  dollarsSent: number
  netLoss: number
}

const num = (v: string): number | null => (v === '' ? null : Number(v))

export function parseTimestamp(v: string): Date {
  const [date, time] = v.split(' ')
  const [m, d, y] = date.split('/').map(Number)
  const [h, min] = time.split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}

function toEvent(r: Row): KitEvent {
  return {
    id: r.event_id,
    member: r.synthetic_member_id,
    at: parseTimestamp(r.event_timestamp),
    category: r.event_category,
    type: r.event_type,
    channel: r.channel,
    paymentId: r.payment_id,
    rail: r.payment_rail,
    amount: Number(r.amount),
    recipientId: r.recipient_id,
    recipientStatus: r.recipient_status,
    recipientAgeDays: num(r.recipient_age_days),
    daysSinceLastSameRail: num(r.days_since_last_same_rail),
    baselineRatio: num(r.amount_to_baseline_ratio),
    profileChangeRecent: r.profile_change_recent === 'Yes',
    passwordResetRecent: r.password_reset_recent === 'Yes',
    paymentStatus: r.payment_status,
    memberResponse: r.member_response,
    note: r.event_note,
  }
}

function toKey(r: Row): MemberKey {
  return {
    member: r.synthetic_member_id,
    persona: r.anchor_persona,
    scenario: r.scenario_type,
    subtype: r.scenario_subtype,
    lookalike: r.is_legitimate_lookalike === 'Yes',
    summary: r.journey_summary,
    outcome: r.journey_outcome,
    scamPaymentIds: r.scam_payment_ids.split(';').filter(Boolean),
    dollarsSent: Number(r.dollars_sent),
    netLoss: Number(r.net_member_loss),
  }
}

export const events: KitEvent[] = parseCsv(eventsCsv).map(toEvent)
export const memberKeys: MemberKey[] = parseCsv(keyCsv).map(toKey)

const byMember = new Map<string, KitEvent[]>()
for (const e of events) {
  const list = byMember.get(e.member) ?? []
  list.push(e)
  byMember.set(e.member, list)
}

export function eventsFor(member: string): KitEvent[] {
  return byMember.get(member) ?? []
}

export function keyFor(member: string): MemberKey {
  const key = memberKeys.find((k) => k.member === member)
  if (!key) throw new Error(`Unknown member ${member}`)
  return key
}

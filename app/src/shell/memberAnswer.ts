import keyCsv from '@kit/HuskyHack_Member_Key_v2.csv?raw'
import { parseCsv } from '../data/csv'
import { keyFor } from '../data/kit'
import { groupOf } from '../data/triggers'
import { money } from '../ui/format'

/**
 * The Member Key row for one member, for the Design check's "what really happened" section and
 * nowhere else: no rule and no member or staff screen reads it.
 */
export type Answer = {
  member: string
  /** The Design check row this member is scored in. */
  group: string
  scam: boolean
  netLoss: number
  fields: { column: string; value: string }[]
}

export const KEY_FILE = 'HuskyHack_Member_Key_v2.csv'

const rows = parseCsv(keyCsv)

const DOLLARS = /^(dollars_|net_member_loss$)/

/** A key cell as the page shows it: dollar columns as money, the rest as written. */
export const cell = (column: string, value: string) =>
  value !== '' && DOLLARS.test(column) ? money(Number(value)) : value

export function answerFor(member: string): Answer {
  const key = keyFor(member)
  const row = rows.find((r) => r.synthetic_member_id === member)
  if (!row) throw new Error(`${member} has no Member Key row`)
  return {
    member,
    group: groupOf(key),
    scam: key.scenario !== 'Normal Activity',
    netLoss: key.netLoss,
    fields: Object.entries(row)
      .filter(([column]) => column !== 'synthetic_member_id')
      .map(([column, value]) => ({ column, value: cell(column, value) })),
  }
}

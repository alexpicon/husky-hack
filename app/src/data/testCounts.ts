import { evaluate } from './triggers'

export const counts = (trigger: Parameters<typeof evaluate>[0]) =>
  Object.fromEntries(evaluate(trigger).map((r) => [r.group, `${r.flagged}/${r.total}`]))

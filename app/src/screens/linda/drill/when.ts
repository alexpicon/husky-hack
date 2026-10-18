import { lindaFacts, plusMinutes } from '../facts'

/** The drill is a concept with no kit row, set this long before her wire. */
export const DRILL_WEEKS_BEFORE = 3

export const drillDay = () =>
  plusMinutes(lindaFacts().wire.at, -DRILL_WEEKS_BEFORE * 7 * 24 * 60)

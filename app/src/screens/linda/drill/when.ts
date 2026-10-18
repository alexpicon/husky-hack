import { lindaFacts, plusMinutes } from '../facts'

/**
 * The drill is a concept with no kit row, set this long before her wire: a trusted contact she adds
 * there is older than TRUSTED_RECENT_DAYS by then, so the rules let it get the one-tap message.
 */
export const DRILL_WEEKS_BEFORE = 5

export const drillDay = () =>
  plusMinutes(lindaFacts().wire.at, -DRILL_WEEKS_BEFORE * 7 * 24 * 60)

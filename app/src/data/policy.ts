/**
 * Product decisions that are still open. Each default is the Phase 2 brief's
 * choice; the alternative is the reviewers' recommendation. Flip one value to
 * switch the behavior and its copy everywhere.
 */
export const POLICY = {
  /** Can a "Yes" on the prior contact release a full-stop takeover payment? */
  fullStopRelease: 'callback' as 'yes' | 'callback',
  /** While a takeover case is open, hold every outgoing payment or only the risky ones. */
  caseHold: 'all' as 'all' | 'risky',
  /** Also stop a payment to a payee added today within 2 hours of a reset, code or failed login. */
  sessionRule: false,
  /** Linda's rule: each wire at 3x, or the day's wires to one payee added together at 2.5x. */
  lindaRule: 'per-wire-3x' as 'per-wire-3x' | 'same-day-2.5x',
  /** Where "I think I've been scammed" appears: every Sound app screen, or the real member's only. */
  reportLink: 'everywhere' as 'everywhere' | 'real-member',
}

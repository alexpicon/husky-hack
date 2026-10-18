import type { POLICY } from './policy'

/**
 * The Phase 2 brief's answer to each open decision. Tests set these before they check the brief's
 * behavior, so a flip in policy.ts fails only the one test that pins the policy in effect.
 */
export const BRIEF_POLICY: typeof POLICY = {
  fullStopRelease: 'yes',
  caseHold: 'all',
  sessionRule: false,
  lindaRule: 'per-wire-3x',
  reportLink: 'everywhere',
}

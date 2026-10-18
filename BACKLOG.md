# Backlog

Known gaps found while building, kept here so they are neither fixed in passing nor lost.

## Triggers

- **Tricked trigger never fires on cash.** It misses all 8 cash withdrawals in the government-impersonation journeys, including the anchor persona James (M1004): cash has no recipient and these members use cash often. Candidate: flag cash at 4x usual or more. On the kit that catches 5 more cases and adds 2 car-purchase look-alikes, which already get a confirmation step today.
- **Family emergency misses M1019 and M1035** (2.56x and 2.59x usual). Candidate: wire at 2.5x usual to a new recipient. On the kit that catches 12 of 12 with no new look-alikes.
- **Takeover trigger needs a password reset.** An attacker who phished the password can skip it. Test 2 of the 3 signals in shadow mode.

## Product

- **Linda's outcome depends on the silent check persuading her.** If she still insists, she loses the same $8,500. Consider releasing at the end of the 4-hour hold when her taps match a scam.
- **Sunday scope:** Linda's mode working end to end, the M1057 home-closing look-alike, the trusted-person flow, Michael's "I think I was scammed" recovery path, up to 10 slides, rehearsal.
- **Accessibility promises in the README** (Spanish, a screen-reader pass) are not implemented yet.

## Infrastructure

- **Shared sessions fall back to function memory** when the Vercel project has no store. Connect Upstash Redis (Vercel Storage) so a cold start cannot drop session state.
- **oxlint fast-refresh warnings** in `app/src/ui/primitives.tsx`: tone constants are exported next to components.

## Repository

- **Commit `de8f6ca` carries a co-author trailer.** Removing it means rewriting history after that commit and force-pushing `main`.

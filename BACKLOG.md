# Backlog

Known gaps found while building, kept here so they are neither fixed in passing nor lost.

## Triggers

- **Cash a member insists on still goes out.** James's heads-up reaches the teller on all 7 government-impersonation cash withdrawals, but it holds nothing: the teller decides. In the kit, 5 of those withdrawals ($35,500) went out. Options: hold cash at 4x the member's 12-month 90th-percentile payment or more (on the kit that holds 5 of the 7, including 4 that went out, and adds 2 car-purchase look-alikes, M1022 and M1040, which already get a confirmation step today), or a teller-tablet check at 3x or more (untested).
- **Family emergency misses M1019 and M1035** (2.56x and 2.59x their 12-month 90th-percentile payment). Candidate: wire at 2.5x that payment to a new recipient. On the kit that catches 12 of 12 with no new look-alikes.
- **Takeover trigger needs a password reset.** An attacker who phished the password can skip it. Test 2 of the 3 signals in shadow mode. The 2-hour rule is built behind `POLICY.sessionRule` (off by default) and needs no reset: a payee added today, paid within 2 hours of a reset, a one-time code or a failed sign-in. On the kit it alone catches 12 of 12 takeovers and none of the other 106 members.
- **A card-only tier** for wires to payees added in the last 30 days (first wire ever or none in 180+ days, ratio 3 or more). Tested on the kit: it adds no scam coverage and touches all 4 home closings (M1057, M1067, M1075, M1104).
- **Michael's pattern card comes late.** It shows on the 4th growing payment, so his first $441.00 is already gone, and it is advice: he decides. It also shows to 3 of 20 look-alikes funding their own brokerage accounts (M1064, M1090, M1101) until they tap "This is my own account".

## Product

- **Linda's outcome depends on the silent check persuading her.** If she still insists, she loses the same $8,500.
- **Ask the prior contact when the email or phone changes.** Today it is asked only once a payment is paused; asking at the change itself would reach the real member before any payment starts.
- **An interactive M1057 story.** The home-closing look-alike is one line today: Second Look adds no hold to M1057's $51,586.52 closing (payee added 2 days earlier), and Sound's existing wire review is unchanged.
- **A staff queue** sorted by unsent money at risk and deadline, with duplicate alerts merged into one case.
- **A member page for a real phone (`?view=phone`).** No device frame or scaling, 44 px targets, reflow at 320 px. `?view=member` scales the whole device down, so its buttons shrink on a phone.
- **Arrow keys capture member controls.** The story steps on ArrowLeft and ArrowRight anywhere but a text input (`app/src/App.tsx`), so arrow keys inside a member radio group move the story instead.
- **Spanish and large text.** Neither is built, and every member screen exists in two looks, so each lands twice.
- **M1039's No and Not sure stay on the member's phone.** The staff case is not synced for them, so it still reads "Waiting for member".
- **No report link on M1039's check and released screens in the Concept look.** Those screens have no app bar, so "I think I've been scammed" shows only on the first screen there; the Sound look has it on all three app screens.

## Infrastructure

- **Shared sessions fall back to function memory** when the Vercel project has no store. Connect Upstash Redis (Vercel Storage) so a cold start cannot drop session state.
- **A payment-state service.** Idempotent actions and staff roles enforced on a server, so a final outcome can't be undone or sent twice from another window. Today the state lives in the browser and the session relay.
- **Bundle size.** The build is one 2 MB script because the 1.4 MB events CSV is inlined with `?raw`, and Vite warns past 500 kB. Serve the CSV as its own asset or split the chunk.
- **oxlint fast-refresh warnings** in `app/src/ui/primitives.tsx`, `ui/soundApp.tsx`, `ui/look.tsx` and `shell/view.tsx`: constants and hooks are exported next to components.

## Repository

- **Commit `de8f6ca` carries a co-author trailer.** Removing it means rewriting history after that commit and force-pushing `main`.

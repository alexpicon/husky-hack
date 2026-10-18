# Second Look

> **Facts go to the real member, never to whoever is logged in.**
>
> When something looks wrong, Sound pauses the payment before the money leaves and puts one true fact in front of the right person, using only data Sound already keeps.

---

## In plain words

Scammers steal money in two ways:
1. **They break into your account** and send the money themselves (an *account takeover*).
2. **They trick you** into sending it yourself (an *authorized scam*).

Second Look watches for the moment just before money leaves. When the signs line up, it **pauses the payment** and puts **one true fact from Sound's records** in front of the right person:
- In a **takeover**, the facts go to the **real member, on a contact the attacker didn't set**. Whoever is signed in sees only "This payment is being reviewed."
- When a member is being **tricked**, the fact goes to the member, who can **check the story quietly**. The member still makes the final call.

One product, two modes. Rules decide; people release.

---

## Who it's for

| Person | Who they are | What happened in the kit's data |
|---|---|---|
| **Sarah (M1003)** | A member who got a fake "Sound" text | She typed her password and code into a fake site. In **35 minutes** (10:02 to 10:37 PM) the scammer reset her password, changed her email and phone, added a recipient and sent **$3,006.33** in two P2P payments. She reported it 57 hours after the first payment. Nothing was recovered. |
| **Linda (M1001)** | A retired teacher | A fake grandson and a fake lawyer told her to keep it secret. She went to a branch to wire **$8,500**, her first wire in **6.6 years**, to an account added 7 minutes earlier. Sound held it, offered a trusted contact and called her. She insisted, and it was released. **She lost $8,500.** |
| **M1039** (honest look-alike for Sarah) | A real member who moved | Reset a forgotten password, updated their address after the move, and the next day paid **$4,151.68** in rent to a new landlord. Only the address changed, so Second Look asks for **one tap** and releases the rent when they tap. |
| **M1057** (honest look-alike for Linda) | A real member buying a home | A **$51,586.52** home-closing wire to a recipient added 2 days earlier. **Second Look adds no hold** to it; **Sound's existing wire review is unchanged.** |

Sarah and Linda come from the kit's four anchor personas (M1001 to M1004). M1039 and M1057 come from its 20 legitimate look-alikes.

---

## Mode 1: Takeover (Sarah and M1039)

### Two tiers
Both need a **password reset** (`password_reset_recent = Yes`) and a payment to a **new recipient** (`recipient_status = New`). What changed on the profile in the 30 days up to the payment picks the tier:

| Tier | When | What happens | In the kit |
|---|---|---|---|
| **Full stop** | The **email or phone** changed, and the change wasn't confirmed on the contact the member had before | The payment stops before it is sent. The facts and one question go to the number on file before the change | Takeovers **12 of 12**. Routine 0 of 50, look-alikes 0 of 20, the other scams 0 |
| **Light check** | Only the **address** changed | One tap on the phone the member has always had | Exactly the 4 honest movers (M1039, M1041, M1051, M1114). No scam |

- A contact change confirmed on the contact the member had before counts toward the light check, and the staff card says "Contact change confirmed on the prior number". No kit member has one.
- In the kit, Sound's own step (hold the payment and text the number on file before the change) saved every takeover it reached (6 of 6, $0 lost) and landed 13 to 15 minutes after the payment started. Where it never came, the money was gone 14 to 19 minutes after the start: all $15,666 of the kit's takeover losses. **Second Look moves that step to the moment the payment starts.**

### Sarah: three zones
In the Both view, Sarah's story shows three labeled screens side by side, each with a "Who sees this" line: the **Scammer's device** (logged in as Sarah), **Sarah's real phone** (the number on file before the 10:15 PM phone change) and **Sound staff**.

1. 13 minutes after a password reset, someone signed in as Sarah pays **$1,574.18** by P2P (P1003-007) to a recipient added 3 minutes earlier. Email and phone both changed tonight, so it's a full stop, paused before send.
2. **The scammer sees only this**, in both phone looks:
   > **This payment is being reviewed.** We'll let you know when it's done.
   >
   > Payment: $1,574.18 · Status: Pending review

   No event times, IDs or signals, and no word about who else is being asked.
3. **Sarah's real phone gets the facts and one question:**
   > Sound here. Tonight your password was reset at 10:09 PM, and your email and phone number were changed at 10:14 PM and 10:15 PM.
   >
   > We paused a payment from your account at 10:22 PM. Are you sending $1,574.18 to a recipient added at 10:19 PM?
   >
   > If a website or caller told you to expect this text, tap No. Sound will never call you and ask you to tap Yes.

   Below it: "Sound will never call or text to ask for a code. If a website or caller asks for one, it's a scam."
4. She taps **No**. The payment stays stopped and a specialist locks online access.
5. The scammer's screen ends at "Signed out: account locked". Her phone says **"We stopped the payment and locked online access"**, how to get back in (the number on her card, or any branch) and offers "Report a scam". The second payment never starts. In the kit, without Second Look, a second $1,432.15 followed 8 minutes later and she lost $3,006.33.

**Sound staff** see a case naming the tier ("Full stop") and why ("Email and phone changed 10:14-10:15 PM, not confirmed on the prior contact"), the three signals, tonight's timeline with event IDs, the paused payment, which contacts changed and which didn't, and three buttons: **Release (after verifying)**, **Keep stopped and lock account**, **Start recovery**. P2P recalls usually fail (6 of 8 in the kit), so the pause comes before send.

### M1039: one tap
M1039 reset a forgotten password at 11:51 AM and updated their address at 12:07 PM. The next day they pay $4,151.68 (P1039-005, ACH) to a new landlord. Only the address changed: the light check.

1. **In the app**, which whoever is signed in sees: "This payment needs a quick yes before $4,151.68 goes. If you started it, check your messages from Sound." No signals, times or IDs. "I lost that phone" points to the number on the card or a branch with ID, and nothing is sent meanwhile.
2. **A text to the phone they've always had:** "Was this you? $4,151.68 to a new recipient, today at 12:55 PM." **Yes** releases it for processing. **No** stops it, holds new payees and starts a staff check. **Not sure** keeps it paused while a specialist calls that number. With no answer within 4 hours it isn't sent: Sound texts and calls that number, and they can send it again.
3. **Released when they tap.** In the kit, without Second Look, this payment went through in 12 minutes with no check. The light check adds one tap for the 4 movers; **66 of 70 honest members see nothing**, and none gets the full stop.

---

## Mode 2: Tricked member (Linda)

### The rule in effect
- a **wire** at least **3x the member's 12-month 90th-percentile outgoing payment** (`amount_to_baseline_ratio` at least 3),
- to a recipient **added less than 1 day earlier** (`recipient_age_days` under 1; a blank age never counts),
- when the recipient is new or it's the first wire in 180 days.

In the kit: family emergency **10 of 12**, government impersonation 4 of 12, romance 0 of 12, takeover 0 of 12, look-alikes 0 of 20, routine 0 of 50. It fires first on Linda's $8,500 wire (P1001-003), 2,411 days after her last wire, at 4.77x.

### Linda: five steps
Two labeled screens: **Linda: branch tablet** and **Sound staff: wire desk**.
1. **What happened, from the kit.** Sound held her wire, offered a trusted contact and called her. She had been told to keep it secret, so it went anyway. The next day, $4,250 in cash "for bail" was stopped at the branch.
2. **A true fact, then a silent check.** The first line she sees: "This would be your first wire in 6 years, to an account added 7 minutes ago." Then she taps what is going on today, without saying it out loud: a family member in trouble, a lawyer or official, told to keep it secret, bail or a fine, told what to say to the bank, something else, none of these, or "I'd rather talk privately".
3. **She checks the story herself.** A scam is named only when 2 or more of her own taps fit it: "Some of what you tapped is how the grandparent scam works. Let's check before you send. Real lawyers don't ask families to keep bail a secret." Otherwise: "We can't confirm this request from your answers. You can still get help checking it." Everyone on hold is told to call the person on the number **they** saved, not a number someone gave them today. If she asks to talk privately, her screen shows no scam words and staff come to her.
4. **A trusted person, labeled as illustrative.** If she had chosen someone earlier, one tap asks them to call her; they never see an amount or her account. In the kit she had none and declined the offer at 2:26 PM, and the screen says so.
5. **She decides, and it ends.** "Cancel this wire", "Help me check this" or "I still want to send - talk to staff". The tablet says "We'll check back by 6:11 PM" (never a countdown), and that if Sound can't reach her by then, the wire isn't sent. Four endings, each final: cancelled, sent after talking with staff, help requested, or not sent because no one answered. Each adds: "Scammers often come back for more. If anyone asks you for more money, call us first."

**The wire desk** sees the wire, the rule, the hold's end time, the silent check, a short script for the scam her shared taps fit, and four buttons that change the case in every window: **Release** (with a reason), **Keep holding (up to 4h)**, **Escalate**, **Open a case**. "Linda decides: Sound can delay and advise, not refuse."

In the kit's 12 family emergencies, 4 with no hold or question lost $28,500, 4 who gave a coached yes lost $21,158, and the 4 who asked for help lost $0. That is why the check is silent.

### The honest look-alike
**M1057:** **Second Look adds no hold** to M1057's $51,586.52 closing (payee added 2 days earlier); **Sound's existing wire review is unchanged.**

---

## "I think I've been scammed"

- **Where:** a link under the app bar, in both phone looks, and a "Report a scam" row at the end of Sarah's story (her real phone) and Linda's (her tablet).
- **One tap** files the report and says what happens next: "We've paused outgoing payments and opened case [ref]. A specialist will call you on a number you've had with us for a while, by [time]." The time is 20 minutes after the report: all 27 scam reports in the kit had a case open within 20 minutes.
- **Three states:** report received, recall requested, money recovered ("Only if that bank sends it back. P2P recalls usually fail: 6 of 8 in the kit.").
- "Anyone who asks for a fee to get your money back is a scammer."
- **Staff** see "Scam reported in the app" ("at the branch" from Linda's tablet, "by text" from Sarah's thread) on that member's case with the time, the callback deadline and a **Request recall** button, in every window and on every laptop in a shared session.

---

## What we miss (on purpose)

- **Romance: 0 of 12**, the kit's biggest loss: $77,864 lost, none recovered. **Michael (M1002):** small P2P payments grew for weeks, then turned into wires. **$8,487.77 lost; no rule fires; the report path is what still helps.**
- **Cash** stays with the teller. In the kit, 6 of 11 scam withdrawals were stopped at the branch ($28,250); $35,500 still went out. No Second Look rule covers cash; a known gap.

---

## Tested on the kit's data (a design check, not a fraud rate)

`npm test` asserts every number here, and the **Design check** tab computes them live in the browser.

| Rule | Takeover | Family emergency | Gov't impersonation | Romance | Look-alikes | Routine |
|---|---|---|---|---|---|---|
| Full stop | **12/12** | 0/12 | 0/12 | 0/12 | 0/20 | 0/50 |
| Light check (one tap) | 0/12 | 0/12 | 0/12 | 0/12 | 4/20 | 0/50 |
| Linda's rule (3x per wire) | 0/12 | **10/12** | 4/12 | 0/12 | 0/20 | 0/50 |

**With these rules we act on 26 of 48 kit scam journeys and stop 0 of 70 honest members.** The light check asks the 4 honest members who moved for one tap.

The kit is about 41% scam victims by design (48 of 118 members), and real life is far lower. These numbers show how the design behaves. **They are not accuracy claims.** The rules read only the events file; the Member Key scores them.

---

## Open decisions (`app/src/data/policy.ts`)

Each decision has both behaviors built and tested, with matching words on every screen. The defaults are in effect.

| Setting | In effect | Alternative |
|---|---|---|
| `fullStopRelease` | `'yes'`: a Yes from the number on file before the change releases a full stop | `'callback'`: a specialist calls that number first. Yes still releases the light check |
| `caseHold` | `'all'`: every outgoing payment waits while a full-stop case is open | `'risky'`: new payees, payee edits and profile changes wait; scheduled payments to existing payees continue |
| `sessionRule` | off | The 2-hour rule: a payment to a payee added today, within 2 hours of a reset, a one-time code or a failed sign-in, is also a full stop. Alone it catches 12 of 12 takeovers and 0 of the other 106 members, and it keeps the full stop when an attacker skips the reset or changes only the address |
| `lindaRule` | `'per-wire-3x'` (above) | `'same-day-2.5x'`: that day's wires to one recipient added less than 1 day earlier, added together, at 2.5x. Family **12 of 12**, gov't 4 of 12, romance 0, look-alikes 0 of 20, routine 0 of 50: 28 of 48 overall. It also holds the second half of a split wire |
| `reportLink` | `'everywhere'`: the link is on every app screen, the scammer's included | `'real-member'`: only on screens the real member holds |

---

## Rules we follow

- **Data:** only data Sound already keeps: the kit's fields. No new data source, no device data, voice, calls, texts, email, browser history or social media, and no fraud-consortium feeds.
- **No age rules.** No rule reads age.
- **The member decides** on their own payment. Sound **stops** only takeovers.
- **Holds** last up to 4 hours, and an unanswered hold ends unsent, with the money still in the account. **P2P** pauses happen before send.
- **Trusted person:** optional, chosen ahead of time, removable anytime, informed only, never given access, and skipped if they look involved. Illustrative here: the kit has no trusted-contact identities.
- **No blame** in any wording.

## Privacy

- **Whoever is signed in learns nothing.** The scammer's paused screen and M1039's in-app check carry no times, event IDs or signals. Render tests check both screens in both phone looks.
- **Facts go only to a contact the attacker didn't set:** the number on file before the change, or a phone that never changed.
- **Linda's answers stay on the tablet** unless she turns on "Share my answers with staff", which starts off for every case. Staff can't tell skipping from not sharing. Asking to talk privately is the one tap staff always see.
- **A shared session** holds only the demo's state (the step, the phone look, Linda's case and the report) under a short code. With Upstash Redis it expires after 12 hours; without it, it lives only in the server's memory.

## Accessibility (what is built)

- Every button, switch and field has a label, and decorative icons are hidden from screen readers.
- Keyboard focus is always visible.
- Every status is written in words ("Pending review", "Payment paused", "Wire cancelled"); color only repeats it.
- Animations follow the device's reduced-motion setting.
- Plain words, and a path without a smartphone: the number on the card or a branch.
- Not built yet: Spanish, a large-text mode and a full screen-reader pass.

---

## 90-day pilot (all numbers are assumptions)

- **Days 1-30, a shadow month:** the rules run in the background only. We count the honest members who would have been paused. To go live, triggered test cases must be paused before send in integration tests (100%).
- **Days 31-90, a small group:** live at 2 branches, the wire desk and a small opted-in digital group. Expand only if honest-member delays and complaints stay within targets.
- **Stop rule:** if honest members are paused too often, review the rule, staffing and group before expanding. Raising amount thresholds alone reopens the small-scam gap.

**Assumptions, not Sound data**, in the starter kit's success measures:

| Measure | Assumed today | Pilot target |
|---|---|---|
| Dollars of harm prevented | Unknown: the shadow month measures it | Set from the shadow month, not invented |
| False-positive rate (honest payments given an extra review) | 3 in 100 | 1 in 100 or fewer |
| Time from hold to release for legitimate members (median / slowest 5%) | 2 h / 4 h | 15 min / 1 h, in service hours |
| Employee effort (staff time per resolved case) | 15 min | 8 min or less |
| After-hours holds waiting for review (held past 4 hours) | Some wait for the next morning | None: an unreviewed payment is not sent |

---

## Prototype

The app in `app/` runs every rule live in the browser on the organizers' CSV files in `huskyhacks/`.

```bash
cd app && npm install && npm run dev
```

`npm test` checks the rules and the screens against the numbers above. Arrow keys step through a story; keys 1-4 switch tabs; `#sarah/3` opens Sarah's third step. The phone look switches between **Concept** and **Sound app** (`?look=sound`).

**Presenting on several laptops.** `?view=member` shows the member's screens full size and `?view=staff` the staff console; the switch next to Back/Next does the same. **Start session** gives a short code, a QR code for the phone remote (`?view=remote`), and links for a member screen and a staff screen. Every device in the session shares the step, the phone look, Linda's case and the report. Without a session, windows on one laptop stay in sync, and so do laptops that open `npm run demo` on the same network (Vite prints the address). If the Wi-Fi blocks laptop-to-laptop traffic, use a phone hotspot.

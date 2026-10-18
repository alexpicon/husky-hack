# Second Look

> **One true fact, to the right person.**
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
- At the **teller window**, the teller gets a **heads-up** when cash or a wire follows a recent call to the contact center. Nothing is held; the teller and the member decide.

One product, two modes. Rules decide; people release.

---

## Who it's for

| Person | Who they are | What happened in the kit's data |
|---|---|---|
| **Sarah (M1003)** | A member who got a fake "Sound" text | She typed her password and code into a fake site. In **35 minutes** (10:02 to 10:37 PM) the scammer reset her password, changed her email and phone, added a recipient and sent **$3,006.33** in two P2P payments. She reported it 57 hours after the first payment. Nothing was recovered. |
| **Linda (M1001)** | A retired teacher | A fake grandson and a fake lawyer told her to keep it secret. She went to a branch to wire **$8,500**, her first wire in **6.6 years**, to an account added 7 minutes earlier. Sound held it, offered a trusted contact and called her. She insisted, and it was released. **She lost $8,500.** |
| **Michael (M1002)** | A member who met someone online: a relationship investment scam | Payments to someone he added on Sep 8 grew for 13 days ($87.95, $132.93, $220.12, $306.77), then turned into wires of $1,500, $2,400 and $3,840 to a second new payee. He confirmed 4 warnings and reported it when the platform blocked withdrawals. **He lost $8,487.77.** |
| **James (M1004)** | A member told his identity was tied to a federal case | On Oct 14 at 2:04 PM he called the contact center about the daily cash limit and how fast a wire arrives. The next day at 4:17 PM he asked a teller for **$7,000** in cash, 4.71x his 12-month 90th-percentile payment. The teller asked, he asked for help, added a trusted contact and cancelled. **He lost $0.** |
| **M1039** (honest look-alike for Sarah) | A real member who moved | Reset a forgotten password, updated their address after the move, and the next day paid **$4,151.68** in rent to a new landlord. Only the address changed, so Second Look asks for **one tap** and releases the rent when they tap. |
| **M1057** (honest look-alike for Linda) | A real member buying a home | A **$51,586.52** home-closing wire to a recipient added 2 days earlier. **Second Look adds no hold** to it; **Sound's existing wire review is unchanged.** |

Linda, Michael, Sarah and James are the kit's four anchor personas (M1001 to M1004). M1039 and M1057 come from its 20 legitimate look-alikes.

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
4. She taps **No**. The payment stays stopped and a specialist locks online access. Her answer locks both buttons, in every window. If she taps **Yes** instead, a Yes alone sends nothing: her phone says a specialist will call that number first, staff see "specialist callback required before release" with **Callback done: confirmed** before Release, and the scammer's screen stays at Pending review. Going on from there, the callback hears it wasn't her and the story ends as below.
5. The scammer's screen ends at "Signed out: account locked". Her phone says **"We stopped the payment and locked online access"**, how to get back in (the number on her card, or any branch) and offers "Report a scam". The second payment never starts. In the kit, without Second Look, a second $1,432.15 followed 8 minutes later and she lost $3,006.33.

**Sound staff** see a case naming the tier ("Full stop") and why ("Email and phone changed 10:14-10:15 PM, not confirmed on the prior contact"), the three signals, tonight's timeline with event IDs, the paused payment, which contacts changed and which didn't, and three buttons: **Release (after verifying)**, **Keep stopped and lock account**, **Start recovery**. P2P recalls usually fail (6 of 8 in the kit), so the pause comes before send.

### M1039: one tap
M1039 reset a forgotten password at 11:51 AM and updated their address at 12:07 PM. The next day they pay $4,151.68 (P1039-005, ACH) to a new landlord. Only the address changed: the light check.

1. **In the app**, which whoever is signed in sees: "This payment needs a quick yes before $4,151.68 goes. If you started it, check your messages from Sound." No signals, times or IDs. "I lost that phone" points to the number on the card or a branch with ID, and nothing is sent meanwhile.
2. **A text to the phone they've always had:** "Was this you? $4,151.68 to a new recipient, today at 12:55 PM." **Yes** releases it for processing. **No** stops it, holds new payees and starts a staff check. **Not sure** keeps it paused while a specialist calls that number. With no answer within 4 hours it isn't sent: Sound texts and calls that number, and they can send it again.
3. **Released when they tap.** In the kit, without Second Look, this payment went through in 12 minutes with no check. The light check adds one tap for the 4 movers and no other honest member, and none gets the full stop.

---

## Mode 2: Tricked member (Linda, Michael and James)

### Linda's rule in effect
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

### One case, every department (Michael and James)
Each part of Sound sees one piece today: the app sees Michael's growing payments and online banking his wires; the contact center sees James's call and the teller his cash. For both, Second Look keeps **one member case open across days and channels** and hands the fact to the person who can act. **Scammers work across days and departments. So does Second Look.**

### Michael: a pattern card, late, then a call on every wire
- **The card:** the 4th or later payment in a row, each bigger than the last, to one payee added less than 60 days earlier (`recipient_age_days` under 60; a blank age never counts). Send still works; he decides. Someone paying their own account taps "This is my own account" once and isn't asked about that payee again.
- **The follow-up hold:** within 30 days after a card, every wire or external transfer to a different payee added less than 30 days earlier is held up to 4 hours for a call from Sound, and never past 8 PM, when calls end. While that case is open, each wire to the account gets a call, not just the first. After each call, he decides.
- **In the kit:** the card shows for romance **12 of 12**, look-alikes 3 of 20 (M1064, M1090 and M1101, funding their own new brokerage accounts) and no one else. The hold reaches **all 30** romance scam wires and external transfers (12 of 12 journeys), including all 3 of Michael's ($1,500, $2,400 and $3,840: $7,740), and 0 of 70 honest members.

1. **Each payment bigger than the last.** Before his 4th payment ($306.77, Sep 21 at 10:28 AM) the app shows: "This would be your 4th payment in 13 days to someone you added on Sep 8, each bigger than the last: $87.95, $132.93, $220.12, $306.77." Then a silent check: never met in person, an investment or crypto, keep it from family, an emergency or a fee, none of these, or my own account. A relationship investment scam is named only when 2 or more of his taps fit it. His taps stay on his phone unless he shares them. Then **one check he can do himself**: "Try taking $100 out of the platform. Real platforms let you. If you can't, or they ask for a fee or tax first, stop and call us." He can send, or tap **Not now**, which sends nothing; later steps show the $306.77 as not sent.
2. **His first wire ever, held for a call.** 5 days later he wires $1,500 to an account added 17 minutes earlier. It is held until 8:00 PM, when calls end; if Sound can't reach him by then, it isn't sent and the money stays in his account. Before the call he is asked "Did the withdrawal test work?": "Yes, I took money out", "No, or they asked for a fee first" or "I haven't tried". No answer clears the hold, since a fake platform can let a little out early, and staff see his answer only if he shares it. The call script opens with "Have you been able to withdraw from the platform?" He can wait for the call or cancel the wire.
3. **The case stays open: every wire gets a call.** Staff see one case from the card: the card, each wire to the same account held for a call ($1,500, $2,400 and $3,840), then Oct 10 at 5:16 PM, when the platform blocks withdrawals and he reports it to the contact center. His choices carry forward: "Not now" and a cancelled wire show as not sent. In the kit, $7,740 of his $8,487.77 moved after the turn to wires. The case says: "First $441 gone before the card. He decides at every step." "I think I've been scammed" is on every screen, and its last line names the scam's final squeeze: anyone who asks for a fee to get your money back is a scammer.

**Caught late:** his first $441.00 is gone before the card. The card comes before $8,046.77 of his $8,487.77 moves, and every wire after it gets a call; it is advice, not money saved.

### James: a heads-up for the teller
- **The rule:** a cash or wire payment that starts within 72 hours of a call to the contact center. It reads that a call happened (the event type and time), never what was said. Nothing is held.
- **In the kit:** government impersonation **12 of 12**; takeover, family emergency and romance 0 of 12, look-alikes 0 of 20, routine 0 of 50.

1. **A call the day before.** James calls the contact center about the daily cash limit and how fast a wire arrives. Sound already keeps this record. Next to it, a **pilot concept**, labeled on screen: the agent's live-call screen shows the call's reason code and one question, "Is anyone asking you to move or withdraw money?", with **Asked: no concern**, **Asked: he hesitated** and **Transfer to a specialist**. No hold; the answer is logged on his case, and the teller sees it the next day. It uses the call's reason code, never the call itself.
2. **A heads-up for the teller, no hold.** He asks for $7,000 in cash. The teller sees yesterday's call, the amount (4.71x his 12-month 90th-percentile payment) and asks about the coaching, not the story, the same way every time: "Has anyone told you what to say to us today?" Then: "...or to keep this secret, or to stay on the phone?" The teller can ask it, offer the private tablet check, escalate to a specialist, or **Continue: James's decision**. On the tablet he taps what is going on without saying it out loud, including "Someone told me what to say to the bank", and everyone sees "The government never asks you to move money to keep it safe. Call the agency on a number you look up yourself."
3. **One case across departments.** Staff see yesterday's contact-center call linked to today's cash at the branch. A specialist joins, he chooses to add a trusted contact and cancels the withdrawal at 4:55 PM, as in the kit, and the cash stays. If the teller chose Continue, the case ends with the cash handed over instead.

In the kit, one teller happened to ask James, and he lost $0. 5 other members in the same scam weren't asked, and $35,500 in cash left the branch. The heads-up makes the question happen every time: it fires on all 7 government-impersonation cash requests.

---

## "I think I've been scammed"

- **Where:** a link under the app bar, in both phone looks, and a "Report a scam" row at the end of Sarah's story (her real phone), Linda's and James's (their tablets).
- **One tap** files the report and says what happens next: "We've paused outgoing payments and opened case [ref]. A specialist will call you on a number you've had with us for a while, by [time]." The time is 20 minutes after the report: all 27 scam reports in the kit had a case open within 20 minutes.
- **Three states:** report received, recall requested, money recovered ("Only if that bank sends it back. P2P recalls usually fail: 6 of 8 in the kit.").
- "Anyone who asks for a fee to get your money back is a scammer."
- **Staff** see "Scam reported in the app" ("at the branch" from Linda's or James's tablet, "by text" from Sarah's thread) on that member's case with the time, the callback deadline and a **Request recall** button, in every window and on every laptop in a shared session.

---

## What we still miss (on purpose)

- **Michael, caught late.** Romance is the kit's biggest loss: $77,864 lost, none recovered. The pattern card reaches all 12 romance journeys, but on the 4th growing payment: Michael's first $441.00 is already gone, and the card is advice; he decides. In the kit he lost $8,487.77.
- **2 family emergencies under 3x.** M1019 and M1035 each wired $6,000, at 2.56x and 2.59x their 12-month 90th-percentile payment, under the line of Linda's rule in effect. The `same-day-2.5x` option pauses both.
- **Cash a member still insists on.** James's heads-up is not a hold: the teller decides, and a member who insists can still take the cash. In the kit, 6 of 11 scam withdrawals were stopped at the branch ($28,250) and $35,500 still went out, all of it in government impersonation, where the heads-up reaches the teller on every cash request (7 of 7).

---

## Tested on the kit's data (a design check, not a fraud rate)

`npm test` asserts every number here, and the **Design check** tab computes them live in the browser.

| Rule | Takeover | Family emergency | Gov't impersonation | Romance | Look-alikes | Routine |
|---|---|---|---|---|---|---|
| Full stop | **12/12** | 0/12 | 0/12 | 0/12 | 0/20 | 0/50 |
| Light check (one tap) | 0/12 | 0/12 | 0/12 | 0/12 | 4/20 | 0/50 |
| Linda's rule (3x per wire) | 0/12 | **10/12** | 4/12 | 0/12 | 0/20 | 0/50 |
| James's heads-up (teller, no hold) | 0/12 | 0/12 | **12/12** | 0/12 | 0/20 | 0/50 |
| Michael's pattern card (late) | 0/12 | 0/12 | 0/12 | **12/12** | 3/20 | 0/50 |

**Michael's follow-up hold**, which needs a card first, holds all 30 romance scam wires and external transfers for a call (12 of 12 journeys, every wire to Michael's platform account among them) and no payment of any honest member.

**With these rules we act on 46 of 48 kit scam journeys and stop 0 of 70 honest members; 7 of 70 get one tap or a card.** The light check asks the 4 honest members who moved for one tap, and the pattern card shows to 3 look-alikes; 63 of 70 see nothing. The 2 journeys no rule reaches are the family emergencies under 3x, M1019 and M1035.

The kit is about 41% scam victims by design (48 of 118 members), and real life is far lower. These numbers show how the design behaves. **They are not accuracy claims.** The rules read only the events file; the Member Key scores them.

---

## Open decisions (`app/src/data/policy.ts`)

Each decision has both behaviors built and tested, with matching words on every screen. The brief's defaults are in effect, except `fullStopRelease`.

| Setting | In effect | Alternative |
|---|---|---|
| `fullStopRelease` | `'callback'`: a Yes from the number on file before the change never releases a full stop; a specialist calls that number first. Yes still releases the light check | `'yes'` (the brief's): that Yes releases a full stop |
| `caseHold` | `'all'`: every outgoing payment waits while a full-stop case is open | `'risky'`: new payees, payee edits and profile changes wait; scheduled payments to existing payees continue |
| `sessionRule` | off | The 2-hour rule: a payment to a payee added today, within 2 hours of a reset, a one-time code or a failed sign-in, is also a full stop. Alone it catches 12 of 12 takeovers and 0 of the other 106 members, and it keeps the full stop when an attacker skips the reset or changes only the address |
| `lindaRule` | `'per-wire-3x'` (above) | `'same-day-2.5x'`: that day's wires to one recipient added less than 1 day earlier, added together, at 2.5x. Family **12 of 12**, gov't 4 of 12, romance 0, look-alikes 0 of 20, routine 0 of 50: with the other rules, 48 of 48 overall. It also holds the second half of a split wire |
| `reportLink` | `'everywhere'`: the link is on every app screen, the scammer's included | `'real-member'`: only on screens the real member holds |

---

## Rules we follow

- **Data:** only data Sound already keeps: the kit's fields. No new data source: no device data, no voice or call content (James's rule reads only that a contact center call happened; the pilot concept at the call reads only its reason code), no texts, email, browser history or social media, and no fraud-consortium feeds.
- **No age rules.** No rule reads age.
- **The member decides** on their own payment. Sound **stops** only takeovers.
- **Holds** last up to 4 hours, and an unanswered hold ends unsent, with the money still in the account. **P2P** pauses happen before send.
- **Trusted person:** optional, chosen ahead of time, removable anytime, informed only, never given access, and skipped if they look involved. Illustrative here: the kit has no trusted-contact identities.
- **No blame** in any wording.

## Privacy

- **Whoever is signed in learns nothing.** The scammer's paused screen and M1039's in-app check carry no times, event IDs or signals. Render tests check both screens in both phone looks.
- **Facts go only to a contact the attacker didn't set:** the number on file before the change, or a phone that never changed.
- **Linda's answers stay on the tablet** unless she turns on "Share my answers with staff", which starts off for every case. Staff can't tell skipping from not sharing. Asking to talk privately is the one tap staff always see. Michael's taps and his withdrawal-test answer stay on his screen the same way; marking a payee as his own account always shows, since it stops the card. James's taps stay on the tablet.
- **A shared session** holds only the demo's state (the step, the phone look, the demo run, Sarah's and M1039's answers, Linda's case, Michael's check, James's answers and the report) under a short code. With Upstash Redis it expires after 12 hours; without it, it lives only in the server's memory.

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

`npm test` checks the rules and the screens against the numbers above. Arrow keys step through a story; keys 1-6 switch tabs; `#sarah/3` opens Sarah's third step. The phone look switches between **Concept** and **Sound app** (`?look=sound`).

**Presenting on several laptops.** `?view=member` shows the member's screens full size and `?view=staff` the staff console; the switch next to Back/Next does the same. **Start session** gives a short code, a QR code for the phone remote (`?view=remote`), and links for a member screen and a staff screen. Every device in the session shares the step, the phone look, Sarah's and M1039's answers, Linda's case, Michael's check, James's answers and the report. Without a session, windows on one laptop stay in sync, and so do laptops that open `npm run demo` on the same network (Vite prints the address). If the Wi-Fi blocks laptop-to-laptop traffic, use a phone hotspot.

**Before presenting, click New run** (beside **Start session**, or in the session panel). A session keeps its answers for 12 hours, so a rehearsal ending such as "Wire cancelled" would still be there; New run clears the answers on every screen in the session and puts the story on screen back at step 1. For a fresh code instead, close every demo window, open one, and click **Start session**.

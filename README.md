# Second Look

> When something looks wrong, Sound pauses the payment and shows a true fact from its own records, before the money leaves.

---

## In plain words

Scammers steal money in two ways:
1. **They break into your account** and send the money themselves (an *account takeover*).
2. **They trick you** into sending it yourself (an *authorized scam*).

Second Look watches for the moment just before money leaves. When the signs line up, it **pauses the payment** and shows the member **one true fact from Sound's records**. Then:
- If it's a **takeover**, Sound **stops** the payment and checks with the real member.
- If the member is being **tricked**, Sound helps them **check the story themselves, quietly**. The member still makes the final call.

One product, two modes.

---

## Who it's for

| Person | Who they are | What happened in the kit's data |
|---|---|---|
| **Sarah (M1003)** | A member who got a fake "Sound" text | She typed her password and code into a fake site. In 34 minutes the scammer reset her password, changed her email and phone, added a recipient and sent **$3,006** by P2P. Nobody noticed until 2 days later. Nothing was recovered. |
| **Linda (M1001)** | A retired teacher | A fake grandson and a fake lawyer told her to keep it secret. She went to a branch to wire **$8,500**, her first wire in **6.6 years**, to an account added 7 minutes earlier. Sound held it, offered a trusted contact and called her. She insisted, and it was released. **She lost $8,500.** |

Linda's story is the important one: **Sound's current tools already tried, and the secrecy beat them.** Second Look is built to work even when the member has been told not to talk.

---

## Mode 1: Takeover (Sarah). Built today.

### The trigger
All three on the same account, within the "recent" window in the data:
- a **password reset** (`password_reset_recent = Yes`)
- a **contact change**: email, phone or address (`profile_change_recent = Yes`)
- a payment to a **new recipient** (`recipient_status = New`)

### What happens
1. Sarah's "payment" (really the scammer's) is **stopped before it's sent**. P2P can't be recalled once sent, so the stop has to come first.
2. Sound sends **"Was this you?"** only to contact details that **did not just change**, or asks her to call the number on her card or visit a branch. Never to the new email or phone: the scammer controls those.
3. Staff get a case with the timeline.

### What the member sees (and the scammer, if they're the one logged in)
> **We've paused this payment to keep your account safe.**
> Here's what changed on your account tonight:
> - 10:09 PM: password reset
> - 10:14 PM: email changed
> - 10:15 PM: phone number changed
> - 10:19 PM: new recipient added
>
> If this was you, we'll confirm it with you using contact details you've had with us for a while, or you can call the number on your card.

### What Sound staff see
A case card: the same timeline, the paused amount ($1,574.18), which contact details are "safe" (unchanged) and which just changed, and buttons: **Release** (after verifying) / **Keep stopped and lock account** / **Start recovery**.

### The honest look-alike: it bothers some real members
**M1039** (and M1041, M1051, M1114) really forgot their password, reset it, updated their address after a move, then paid the first month's rent to a new landlord. The trigger catches them too.
- **Their fast path:** their **phone didn't change**, so "Was this you?" goes straight to it. One tap, and the rent goes the same day.
- If everything changed, they confirm by calling the number on the card or at a branch.

---

## Mode 2: Tricked member (Linda). Screens today, working Sunday.

### The trigger
- a **wire or cash** payment that is **much bigger than usual** (`amount_to_baseline_ratio` ≥ 3)
- to a **new recipient**, or the **first payment on that rail in a long time** (`days_since_last_same_rail` ≥ 180)

### What happens
1. Sound uses its **hold** (it can pause a wire for up to 4 hours).
2. Instead of a spoken warning she can refuse, Linda gets a **silent check** on her phone or a branch tablet. She taps what's going on today, without having to say it out loud:
   - "Someone called about a family member in trouble"
   - "A lawyer or official is involved"
   - "I was told to keep this secret"
   - "It's for bail or a fine"
3. If her taps match a known scam, she sees:
   > **What you tapped matches how the "grandparent scam" works.** Real lawyers don't ask families to keep bail a secret.
   > **Before you send, call your grandson on the number YOU have saved**, not a number someone gave you today.
4. If she chose a **trusted person** earlier, she can send one tap: *"Linda would like you to call her."* That person never sees amounts or the account.
5. **Linda decides.** If she still wants to send, she can, after talking to staff. It's her money and her right.

### The card's first line (Sound's own fact)
> This would be your **first wire in 6 years**, to an account **added 7 minutes ago**.

### What Sound staff see
What she tapped (only if she chooses to share it), the facts, a short script for that scam type, and buttons: **Release** / **Keep holding (up to 4h)** / **Escalate** / **Open a case**.

### The honest look-alike
**M1057**: a real **$51,587 home-closing wire**. It's big, it goes to a new recipient, and it's caught. Their silent check shows "buying a home", nothing matches a scam, and one call or tap releases it the same day.

---

## The scam we miss (we show it on purpose)

**Michael (M1002), a romance scam.** His P2P payments grew slowly for weeks, then turned into wires. Our triggers miss most of these cases (only 5 of 12, with too many false alarms), and P2P money can't be recalled.
- **What still helps:** the "I think I was scammed" report path starts recovery faster, and the pilot measures this gap.
- We say it out loud because the judges asked for it, and it builds trust.

---

## Tested on the kit's data (a design check, not a fraud rate)

| Trigger | Scams it flags | Honest look-alikes it flags |
|---|---|---|
| Takeover (reset + contact change + new recipient) | Takeover: **12 of 12** · other scams: 0 · normal members: 0 | 4 of 20 (people who moved) |
| Tricked (big first wire/cash to someone new) | Family emergency: **10 of 12** · gov't impersonation: 4 of 12 | 4 of 20 (home-closing wires) |

The kit is about 41% scam victims by design, and real life is far lower. So these numbers show how the design behaves. **They are not accuracy claims.**

---

## Rules we follow

- **Data:** only the kit's fields. No device data, voice, calls, texts, email, browser history or social media. No fraud-consortium feeds.
- **No age rules.** Triggers never use age.
- **The member decides** on their own payment. Sound **stops** only takeovers.
- **Holds** last up to 4 hours. **P2P** pauses happen before send.
- **Trusted person:** optional, chosen by the member, can be removed anytime, informed only, never given access. It's skipped if the trusted person looks involved (for example, they were just added, or they are the new recipient).
- **No blame** in any wording.
- **Accessible:** plain words, large text, works with a screen reader, Spanish, and a no-smartphone path (the branch or the number on the card).

---

## Why it wins (by judging criteria)

| Criterion | Why |
|---|---|
| **Member safety (30%)** | Stops takeovers before P2P money is gone, and fixes the exact spot where Linda's case failed today (secrecy). Includes a recovery path. |
| **UX & trust (25%)** | Invisible to most members. Real members get a fast path. No blame. The member decides. |
| **Feasibility (20%)** | Uses only fields Sound already has, plus a hold Sound can already do. No new vendor. |
| **Innovation (15%)** | Not a warning or a score: a **true fact** from Sound's records plus a **silent check** that gets around "don't tell anyone". |
| **Prototype (10%)** | Member screen and staff screen, live, on the kit's real personas. |

---

## 90-day pilot (all numbers are assumptions)

- **Days 1–30:** run the triggers in the background only (shadow mode). Count how many honest members would be paused.
- **Days 31–90:** turn on takeover mode for everyone, and tricked mode at 2 branches plus the wire desk.
- **We measure:** dollars of harm prevented, time from hold to release for honest members (target: same day), how many members finish the silent check, staff time per case, and holds waiting after hours.
- **Stop rule:** if honest members are bothered too often, raise the thresholds before expanding.

---

## Demo

**Today (2-minute pitch + 3 minutes of questions)**
1. **0:00–1:00:** Sarah, live. The scammer's payment is stopped, the timeline card shows, and the staff case opens.
2. **1:00–1:20:** M1039, who really moved: one tap, and the rent goes.
3. **1:20–1:50:** "Tomorrow, the harder case. Linda lost $8,500 even after Sound held her wire. Here's how we beat the secrecy." (static screens)
4. **1:50–2:00:** the pilot in one line.

**Sunday (5-minute live demo + 3 minutes of questions, up to 10 slides)**
Both modes live, both look-alikes, Michael as the honest miss, the trusted person, and the pilot.

---

## Build plan

**Today (due 3:00 PM):** takeover mode on Sarah + the M1039 look-alike + the staff case + 2–3 static screens for Linda. Submit at 2:50.
**Sunday (due 3:00 PM):** Linda's mode working + M1057 + the trusted person + the Michael miss + slides + rehearsal.

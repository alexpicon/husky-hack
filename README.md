# Second Look

> **Facts go to the real member, never to whoever is logged in.**
>
> When something looks wrong, Sound pauses the payment before the money leaves and puts one true fact in front of the right person, using only data Sound already keeps.

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
| **Sarah (M1003)** | A member who got a fake "Sound" text | She typed her password and code into a fake site. In 35 minutes the scammer reset her password, changed her email and phone, added a recipient and sent **$3,006** in two P2P payments. Nobody noticed until 2 days later. Nothing was recovered. |
| **Linda (M1001)** | A retired teacher | A fake grandson and a fake lawyer told her to keep it secret. She went to a branch to wire **$8,500**, her first wire in **6.6 years**, to an account added 7 minutes earlier. Sound held it, offered a trusted contact and called her. She insisted, and it was released. **She lost $8,500.** |
| **M1039** (honest look-alike for Sarah) | A real member who moved | Forgot their password, reset it, updated their address after the move, then paid the first month's rent and deposit to a new landlord. **Every takeover signal fires, but it's really them.** Second Look lets them through in one tap. |
| **M1057** (honest look-alike for Linda) | A real member buying a home | A **$51,586.52** home-closing wire to a recipient added 2 days earlier. Second Look adds no hold to it; Sound's existing wire review is unchanged. |

Sarah (M1003) and Linda (M1001) come from the kit's four anchor personas (M1001-M1004). M1039 and M1057 come from its 20 legitimate look-alikes. The challenge asks for one of each.

Linda's story is the important one: **Sound's current tools already tried, and the secrecy beat them.** Second Look is built to work even when the member has been told not to talk.

---

## Mode 1: Takeover (Sarah). Built today.

### The trigger
All three on the same account, within the "recent" window in the data:
- a **password reset** (`password_reset_recent = Yes`)
- a **contact change**: email, phone or address (`profile_change_recent = Yes`)
- a payment to a **new recipient** (`recipient_status = New`)

### What happens
1. Sarah's "payment" (really the scammer's) is **stopped before it's sent**. P2P recalls usually fail (6 of 8 in the kit), so the stop has to come first.
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
A case card: the same timeline, the paused amount ($1,574.18, the first of the two payments; the second never happens), which contact details are "safe" (unchanged) and which just changed, and buttons: **Release** (after verifying) / **Keep stopped and lock account** / **Start recovery**.

### The honest look-alike: it bothers some real members
**M1039** (and M1041, M1051, M1114) really forgot their password, reset it, updated their address after a move, then paid the first month's rent to a new landlord. The trigger catches them too.
- **Their fast path:** their **phone didn't change**, so "Was this you?" goes straight to it, and the rent is released when they tap.
- If everything changed, they confirm by calling the number on the card or at a branch.

---

## Mode 2: Tricked member (Linda). Screens today, working Sunday.

### The trigger
- a **wire** at least **3x the member's 12-month 90th-percentile outgoing payment** (`amount_to_baseline_ratio` ≥ 3)
- to a recipient **added less than 1 day earlier** (`recipient_age_days` < 1)

An alternative in `app/src/data/policy.ts` adds up that day's wires to the same recipient and holds at 2.5x.

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
**M1057**: a real **$51,586.52 home-closing wire**. Second Look adds no hold to it, because the recipient was added 2 days earlier. Sound's existing wire review is unchanged.

---

## The scam we miss (we show it on purpose)

**Michael (M1002), a romance scam.** His P2P payments grew slowly for weeks, then turned into wires. Neither trigger flags him: **$8,487.77 lost**. Across the kit's 12 romance cases, the triggers catch none ($77,864 lost, none recovered).
- **What still helps:** the "I think I've been scammed" report path starts recovery faster, and the pilot measures this gap.

---

## Tested on the kit's data (a design check, not a fraud rate)

| Trigger | Scams it flags | Honest look-alikes it flags |
|---|---|---|
| Takeover (reset + contact change + new recipient) | Takeover: **12 of 12** · other scams: 0 · normal members: 0 | 4 of 20 (people who moved) |
| Tricked (a wire at 3x or more to a recipient added less than 1 day earlier) | Family emergency: **10 of 12** · gov't impersonation: 4 of 12 · romance: 0 of 12 · normal members: 0 | 0 of 20 |

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

The app in `app/` runs both triggers live in the browser on the organizers' CSV files in `huskyhacks/`.

```bash
cd app && npm install && npm run dev
```

`npm test` checks the triggers against the numbers above. Arrow keys step through a story; keys 1-4 switch stories.

**Presenting on several laptops.** One laptop runs `npm run demo` and shares its network address (Vite prints it, e.g. `http://192.168.1.20:5173`). The other laptops open that address with `?view=member` (the phone, full size) or `?view=staff` (the staff console, full width); the switch next to Back/Next does the same. Next, Back, tabs and the phone look stay in sync on every laptop. If the Wi-Fi blocks laptop-to-laptop traffic, use a phone hotspot. Without a network, each laptop works on its own.

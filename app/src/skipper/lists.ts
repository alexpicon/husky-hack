/**
 * What Skipper may suggest on each screen: only taps that point to a scam or ask for a private
 * talk, never one that clears ("None of these", "Something else", "This is my own account").
 * Plain data, free of the kit and React; api/skipper.ts keeps a tested copy of the ids and words.
 */
import { COACHED, DONT_TELL, KEEP_SECRET, NO_DIGAS, PRIVATE, SECRET_WORD } from './patterns.ts'

export type SkipperScreen = 'linda' | 'michael' | 'james' | 'sarah' | 'panel'

/** The scam a signal tap belongs to, for the panel wall. */
export type SkipperGroup = 'grandparent' | 'government' | 'romance'

export type SkipperTap = {
  /** The tap's id on that screen's check; on the panel, `group.tap`. */
  id: string
  /** The check's own label, word for word. */
  label: string
  /** What it covers, for the prompt. */
  about: string
  /** signal: how a scam works. request: asks for a private talk. */
  kind: 'signal' | 'request'
  /** The baseline's patterns; each match's text is the quote. */
  words: RegExp[]
  /** When set, the text must also match this before any of `words` counts. */
  needs?: RegExp
  group?: SkipperGroup
}

const LINDA: SkipperTap[] = [
  {
    id: 'family',
    label: 'Someone called about a family member in trouble',
    about: 'The member says a grandchild, child or other relative is in trouble, hurt, arrested, in jail or needs bail, or a caller claims to be that relative. A relative mentioned with no trouble (a wedding, tuition, a house) is not this tap.',
    kind: 'signal',
    words: [
      /\b(?:grand ?(?:son|daughter|child|kid|baby|boy|girl)s?|gran(?:d)?s[ou]ns?|grandaughter|granddaugher|nephew|niece|nieto|nieta|grandma|grandpa|granny|abuela|abuelo)\b/i,
      /\bmy (?:son|daughter|boy|girl|kid|child)\b/i,
    ],
    needs:
      /\b(?:jail|arrest\w*|bail|bale|trouble|accident|hospital|police|cops?|emergency|hurt|crash\w*|custody|locked up|c[aá]rcel|fianza|detenido|preso|accidente|problemas?|needs? (?:help|money))\b/i,
  },
  {
    id: 'official',
    label: 'A lawyer or official is involved',
    about: 'Her words name a lawyer, attorney, public defender, police officer, detective, sergeant, judge, bondsman or other official as part of the story, even a real one in an honest story. A court, a case or an order mentioned without a person is not this tap.',
    kind: 'signal',
    words: [
      /\b(?:lawyer|lawyr|lawer|attorney|atty|public defender|officer|sergeant|detective|police|judge|bondsman|abogado|polic[ií]a|juez)\b/i,
    ],
  },
  {
    id: 'secret',
    label: 'I was told to keep this secret',
    about: 'The member says someone told them not to tell family, friends or the bank, or to keep it secret, quiet or a surprise.',
    kind: 'signal',
    words: [DONT_TELL, KEEP_SECRET, SECRET_WORD, NO_DIGAS],
  },
  {
    id: 'bail',
    label: "It's for bail or a fine",
    about: 'Her words say the money is for bail, a bond, a fine or court fees. Money for a lawyer, or being arrested or in jail, is not enough on its own.',
    kind: 'signal',
    words: [
      /\b(?:bail|bale|bial)(?:ed|ing)?\b/i,
      /\b(?:pay|paying|a|the|his|her) fines?\b/i,
      /\b(?:court|legal) (?:fees?|costs?)\b/i,
      /\b(?:fianza|multa)\b/i,
    ],
  },
  {
    id: 'coached',
    label: 'Someone told me what to say to the bank',
    about: 'The member says someone gave them a cover story, or told them what to say or not say to the bank or teller.',
    kind: 'signal',
    words: COACHED,
  },
  {
    id: 'private',
    label: "I'd rather talk privately",
    about: 'The member says they cannot talk freely: someone is listening, watching, next to them, on speaker or still on the phone or line, or they ask to talk in private. Always suggest it when the words say so.',
    kind: 'request',
    words: PRIVATE,
  },
]

const MICHAEL: SkipperTap[] = [
  {
    id: 'never-met',
    label: "We've never met in person",
    about: 'Only when the words say they have never met the person face to face, or that they know them only online, from an app or a dating site, or by phone, text or video. Being apart, or planning to meet or be together, is not enough, and meeting online long ago and being together since is not this tap.',
    kind: 'signal',
    words: [
      /\b(?:never|not|haven['’]?t|havent|have not|nvr) (?:actually |yet )?met\b/i,
      /\bnever seen (?:him|her|them) in person\b/i,
      /\bmet (?:him |her |them )?(?:online|on (?:an? )?(?:dating )?(?:app|site)|on (?:facebook|instagram|whatsapp|tinder|bumble|hinge|telegram|wechat|linkedin))\b/i,
      /\bonline (?:girlfriend|boyfriend|friend|partner)\b/i,
      /\bdating (?:app|site)\b/i,
      /\bnunca (?:nos )?(?:hemos )?(?:visto|conocido)\b/i,
      /\bnos conocimos en (?:internet|l[ií]nea)\b/i,
    ],
  },
  {
    id: 'investment',
    label: 'They talked about an investment or crypto',
    about: "The person or their platform talks about an investment, crypto, trading, mining, an investment or trading platform or app, profits or returns, or money that grows or doubles, even when the member does not name the person (for example 'the platform says', 'my profits'). Investing on his own, with no one else bringing it up, is not this tap.",
    kind: 'signal',
    words: [
      /\b(?:invest\w*|crypto\w*|bitcoin|btc|usdt|tether|ethereum|trading|platform|portfolio|forex|profits?|doubles?|doubled|inversi[oó]n|invertir|cripto\w*|plataforma)\b/i,
    ],
  },
  {
    id: 'secret',
    label: 'They asked me to keep this from family or friends',
    about: 'The person asked the member not to tell family or friends, or to keep it between them or from someone.',
    kind: 'signal',
    words: [DONT_TELL, KEEP_SECRET, SECRET_WORD, NO_DIGAS, /\bkeep (?:it|this) from\b/i],
  },
  {
    id: 'emergency',
    label: 'They need money for an emergency or a fee',
    about:
      "The person asks for money for an emergency (a medical bill, travel, customs, being stuck or stranded) or for a fee or tax to unlock, release or withdraw money. A bill the member pays on their own, such as their own or a relative's medical bill, is not this tap.",
    kind: 'signal',
    words: [
      /\b(?:emergenc\w*|hospital\w*|medical|surgery|stuck|stranded|customs|plane ticket|unlock|emergencia|impuestos?|comisi[oó]n)\b/i,
      /\b(?:a|the|withdrawal|release|unlock|processing|clearance) (?:fee|fees|tax)\b/i,
    ],
  },
]

const JAMES: SkipperTap[] = [
  {
    id: 'investigation',
    label: "Someone says I'm under investigation",
    about:
      'Someone claiming to be from a government agency or the police (the IRS, Social Security, Medicare, the FTC, the FBI, a sheriff, a federal agent) contacts the member about an investigation, a warrant or arrest, a lawsuit, a crime, compromised accounts or suspended benefits. A company such as Amazon is not a government agency, and a real letter, bill or refund the member handles on their own is not this tap.',
    kind: 'signal',
    words: [
      /\b(?:investigat\w*|warrant|arrest(?:ed)?|irs|social security|fbi|dea|ftc|federal agent|marshal|sheriff|subpoena|laundering|suspended)\b/i,
    ],
  },
  {
    id: 'move',
    label: 'I was told to move my money to keep it safe',
    about: 'Only when someone told the member to move, withdraw or hide money so it stays safe or protected, for example in a safe, secure, new or government account or a locker. Paying a fine, fee, debt or warrant, or buying gift cards, is never this tap: that is the waiting tap.',
    kind: 'signal',
    words: [
      /\b(?:safe|secure|protected|government|federal) account\b/i,
      /\b(?:protect|keep|secure) (?:my|the|your) (?:money|savings|funds)\b/i,
      /\bmove (?:my|the|all my|all the) (?:money|savings|cash|funds)\b/i,
    ],
  },
  {
    id: 'coached',
    label: 'Someone told me what to say to the bank',
    about: 'The member says someone gave them a cover story, or told them what to say or not say to the bank or teller.',
    kind: 'signal',
    words: COACHED,
  },
  {
    id: 'secret',
    label: 'I was told to keep this secret or stay on the phone',
    about: 'The member says they were told to keep it secret or not tell anyone, or to stay on the phone or not hang up. A caller who is still on the line, without that instruction, is not this tap: that is a reason to talk privately.',
    kind: 'signal',
    words: [
      DONT_TELL,
      KEEP_SECRET,
      SECRET_WORD,
      NO_DIGAS,
      /\b(?:stay|keep me|staying) on the (?:phone|line)\b/i,
      /\b(?:don['’]?t|dont|do not|not to) hang up\b/i,
    ],
  },
  {
    id: 'waiting',
    label: 'Someone is waiting for this cash',
    about:
      'Someone is waiting to collect a payment or the money from the member: gift card codes, a Bitcoin ATM deposit, a courier, someone outside, an agent who will pick it up, or cash the member was told to bring to them. Withdrawing cash, with no one to collect it, is not enough.',
    kind: 'signal',
    words: [
      /\b(?:waiting outside|courier|pick (?:it|the cash|the money) up|gift ?cards?|bitcoin atm|crypto atm|tarjetas de regalo)\b/i,
      /\bwaiting for (?:it|the cash|the money|me)\b/i,
    ],
  },
  {
    id: 'private',
    label: "I'd rather talk privately",
    about: 'The member says they cannot talk freely: someone is listening, watching, next to them, on speaker or still on the phone or line, or they ask to talk in private. Always suggest it when the words say so.',
    kind: 'request',
    words: PRIVATE,
  },
]

/** Sarah's report: what someone posing as Sound does. These go to no check; Skipper only listens. */
const SARAH: SkipperTap[] = [
  {
    id: 'posed',
    label: 'Someone said they were from Sound',
    about: "Someone called, texted or emailed saying they were from Sound, its fraud team, or the member's bank.",
    kind: 'signal',
    words: [
      /\b(?:from|was|were|is) (?:sound|the bank|my bank|the credit union)\b/i,
      /\bfraud (?:dept|department|team)\b/i,
    ],
  },
  {
    id: 'code',
    label: 'I was asked for a code or my password',
    about: 'Someone asked for a one-time code, passcode, PIN or password, or the member read one out.',
    kind: 'signal',
    words: [/\b(?:code|codes|passcode|one[- ]time|otp|password|pin|c[oó]digo|contrase[nñ]a)\b/i],
  },
  {
    id: 'not-me',
    label: "A payment or change I didn't make",
    about: 'A payment, login, or email or phone change happened that the member did not make.',
    kind: 'signal',
    words: [
      /\b(?:didn['’]?t|did not|never) (?:make|send|do|authorize|change)\b/i,
      /\b(?:not me|wasn['’]?t me|no fui yo)\b/i,
    ],
  },
]

const GROUPS: [SkipperGroup, SkipperTap[]][] = [
  ['grandparent', LINDA],
  ['government', JAMES],
  ['romance', MICHAEL],
]

/** Every signal tap of the three scams, each under its own group, so a shared id stays apart. */
const PANEL: SkipperTap[] = GROUPS.flatMap(([group, taps]) =>
  taps
    .filter((t) => t.kind === 'signal')
    .map((t) => ({ ...t, id: `${group}.${t.id}`, group })),
)

export const SKIPPER_LISTS: Record<SkipperScreen, SkipperTap[]> = {
  linda: LINDA,
  michael: MICHAEL,
  james: JAMES,
  sarah: SARAH,
  panel: PANEL,
}

export const isScreen = (s: unknown): s is SkipperScreen =>
  typeof s === 'string' && Object.hasOwn(SKIPPER_LISTS, s)

/** The ids a screen allows, in its list's order. */
export const allowedIds = (screen: SkipperScreen) => SKIPPER_LISTS[screen].map((t) => t.id)

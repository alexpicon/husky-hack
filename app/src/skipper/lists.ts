/**
 * What Skipper may suggest on each screen: only taps that point to a scam or ask for a private
 * talk, never one that clears ("None of these", "Something else", "This is my own account").
 * Plain data with no imports, so the server function can read it without the kit or React.
 */

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

const DONT_TELL =
  /\b(?:don['’]?t|dont|do not|not to|never) (?:tell|mention|say anything to)\b/i
const KEEP_SECRET = /\bkeep (?:it|this|that|everything|quiet|it quiet)? ?(?:a )?(?:secret|quiet|between us)\b/i
const SECRET_WORD = /\b(?:secret|secreto|secreta)\b/i
const NO_DIGAS = /\bno (?:le |les )?(?:digas|diga|cuentes|cuente)\b/i

const COACHED: RegExp[] = [
  /\bwhat to (?:say|tell)\b/i,
  /\b(?:told|tells|asked|wants) me to (?:say|tell|lie)\b/i,
  /\bif (?:the bank|the teller|anyone|someone|they) asks?\b/i,
  /\blie to the (?:bank|teller)\b/i,
  /\bqu[eé] decir\b/i,
]

const PRIVATE: RegExp[] = [
  /\b(?:listening|can['’]?t talk|cannot talk|can['’]?t speak|on speaker(?:phone)?)\b/i,
  /\b(?:talk|speak) (?:in )?private(?:ly)?\b/i,
  /\b(?:somewhere|in) private\b/i,
  /\b(?:right )?(?:here )?(?:next to|behind|beside) me\b/i,
  /\ben privado\b/i,
]

const LINDA: SkipperTap[] = [
  {
    id: 'family',
    label: 'Someone called about a family member in trouble',
    about: 'A caller says a grandchild or other relative is in trouble, hurt, arrested or in jail.',
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
    about: 'A lawyer, attorney, public defender, police officer, judge or other official is part of the story.',
    kind: 'signal',
    words: [
      /\b(?:lawyer|lawyr|lawer|attorney|atty|public defender|officer|sergeant|detective|police|judge|bondsman|abogado|polic[ií]a|juez)\b/i,
    ],
  },
  {
    id: 'secret',
    label: 'I was told to keep this secret',
    about: 'Someone asked the member not to tell family, friends or the bank.',
    kind: 'signal',
    words: [DONT_TELL, KEEP_SECRET, SECRET_WORD, NO_DIGAS],
  },
  {
    id: 'bail',
    label: "It's for bail or a fine",
    about: 'The money is for bail, a bond, a fine, court costs or legal fees.',
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
    about: 'Someone gave the member a cover story, or told them what to say or not say to the bank or teller.',
    kind: 'signal',
    words: COACHED,
  },
  {
    id: 'private',
    label: "I'd rather talk privately",
    about: 'The member cannot talk freely: someone is listening, nearby or on speaker, or they ask to talk in private.',
    kind: 'request',
    words: PRIVATE,
  },
]

const MICHAEL: SkipperTap[] = [
  {
    id: 'never-met',
    label: "We've never met in person",
    about: 'The member has never met the person face to face, for example they met online, on an app or by text.',
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
    about: 'The person brought up an investment, crypto, trading, a platform, or money that grows or doubles.',
    kind: 'signal',
    words: [
      /\b(?:invest\w*|crypto\w*|bitcoin|btc|usdt|tether|ethereum|trading|platform|portfolio|forex|profits?|doubles?|doubled|inversi[oó]n|invertir|cripto\w*|plataforma)\b/i,
    ],
  },
  {
    id: 'secret',
    label: 'They asked me to keep this from family or friends',
    about: 'The person asked the member not to tell family or friends, or to keep it between them.',
    kind: 'signal',
    words: [DONT_TELL, KEEP_SECRET, SECRET_WORD, NO_DIGAS, /\bkeep (?:it|this) from\b/i],
  },
  {
    id: 'emergency',
    label: 'They need money for an emergency or a fee',
    about:
      'The person asks for money for an emergency, a medical bill, travel or customs, or a fee or tax to unlock or withdraw money.',
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
      'Someone says the member is under investigation, faces a warrant, arrest or lawsuit, or calls from the IRS, Social Security, the FBI or police.',
    kind: 'signal',
    words: [
      /\b(?:investigat\w*|warrant|arrest(?:ed)?|irs|social security|fbi|dea|ftc|federal agent|marshal|sheriff|subpoena|laundering|suspended)\b/i,
    ],
  },
  {
    id: 'move',
    label: 'I was told to move my money to keep it safe',
    about: 'Someone told the member to move or withdraw money to protect it, or to put it in a new or government account.',
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
    about: 'Someone gave the member a cover story, or told them what to say or not say to the bank or teller.',
    kind: 'signal',
    words: COACHED,
  },
  {
    id: 'secret',
    label: 'I was told to keep this secret or stay on the phone',
    about: 'Someone told the member to keep it secret, or to stay on the phone or not hang up.',
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
      'Someone is waiting to collect the money: a courier, someone outside, or someone who wants gift card codes or a Bitcoin ATM deposit.',
    kind: 'signal',
    words: [
      /\b(?:waiting outside|courier|pick (?:it|the cash|the money) up|gift ?cards?|bitcoin atm|crypto atm|tarjetas de regalo)\b/i,
      /\bwaiting for (?:it|the cash|the money|me)\b/i,
    ],
  },
  {
    id: 'private',
    label: "I'd rather talk privately",
    about: 'The member cannot talk freely: someone is listening, nearby or on speaker, or they ask to talk in private.',
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

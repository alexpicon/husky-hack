/** The keyword baseline's patterns that more than one screen's list uses. */

export const DONT_TELL =
  /\b(?:don['’]?t|dont|do not|not to|never) (?:tell|mention|say anything to)\b/i
export const KEEP_SECRET = /\bkeep (?:it|this|that|everything|quiet|it quiet)? ?(?:a )?(?:secret|quiet|between us)\b/i
export const SECRET_WORD = /\b(?:secret|secreto|secreta)\b/i
export const NO_DIGAS = /\bno (?:le |les )?(?:digas|diga|cuentes|cuente)\b/i

export const COACHED: RegExp[] = [
  /\bwhat to (?:say|tell)\b/i,
  /\b(?:told|tells|asked|wants) me to (?:say|tell|lie)\b/i,
  /\bif (?:the bank|the teller|anyone|someone|they) asks?\b/i,
  /\blie to the (?:bank|teller)\b/i,
  /\bqu[eé] decir\b/i,
]

export const PRIVATE: RegExp[] = [
  /\b(?:listening|can['’]?t talk|cannot talk|can['’]?t speak|on speaker(?:phone)?)\b/i,
  /\b(?:talk|speak) (?:in )?private(?:ly)?\b/i,
  /\b(?:somewhere|in) private\b/i,
  /\b(?:right )?(?:here )?(?:next to|behind|beside) me\b/i,
  /\ben privado\b/i,
]

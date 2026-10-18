/** What the contact center agent logs after asking, on the pilot's live-call screen. */
export type AgentChoice = 'clear' | 'hesitated' | 'transfer'

export const AGENT_CHOICES: { id: AgentChoice; label: string; hint: string; result: string }[] = [
  { id: 'clear', label: 'Asked: no concern', hint: 'He said no one is', result: 'no concern' },
  { id: 'hesitated', label: 'Asked: he hesitated', hint: 'He paused or changed the subject', result: 'he hesitated' },
  { id: 'transfer', label: 'Transfer to a specialist', hint: 'A specialist joins the call', result: 'transferred to a specialist' },
]

export const PILOT_LABEL = "Pilot concept: uses the call's reason code, never the call itself."
/** The reason code a pilot would log for the kit's call; a test holds it to the kit's own note. */
export const CALL_REASON = 'asked about daily cash limit and wire speed'
export const COACHED_FIRST = 'Scammers often coach members to ask this first.'
export const AGENT_QUESTION = 'Is anyone asking you to move or withdraw money?'

const resultOf = (choice: AgentChoice) => AGENT_CHOICES.find((c) => c.id === choice)!.result

/** How the next teller and the case read the agent's choice: "the agent asked; he hesitated". */
export const agentLine = (choice: AgentChoice) => `the agent asked; ${resultOf(choice)}`

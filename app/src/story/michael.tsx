import type { Scenario } from './engine'

export const michael: Scenario = {
  id: 'michael',
  label: 'Michael',
  sublabel: 'Romance scam',
  tone: 'danger',
  steps: [],
  zones: {
    member: { tone: 'member', label: "Michael's phone", who: 'Michael, in the Sound app' },
    staff: { tone: 'staff', label: 'Sound staff', who: 'Sound Member Protection' },
  },
}

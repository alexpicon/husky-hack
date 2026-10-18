import type { Scenario } from './engine'

export const james: Scenario = {
  id: 'james',
  label: 'James',
  sublabel: 'Gov’t impersonation',
  tone: 'warn',
  steps: [],
  zones: {
    member: { tone: 'member', label: 'James: branch tablet', who: 'James, at the teller window' },
    staff: { tone: 'staff', label: 'Sound staff: teller', who: 'The teller serving James' },
  },
}

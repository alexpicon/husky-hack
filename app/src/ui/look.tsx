import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Smartphone } from 'lucide-react'
import { useWindowSync } from '../shell/sync'

/** How phone mockups render: our concept design, or Sound's current app. */
export type Look = 'concept' | 'sound'

const KEY = 'second-look:phone-look'

const LookContext = createContext<{ look: Look; setLook: (l: Look) => void }>({
  look: 'concept',
  setLook: () => {},
})

export const useLook = () => useContext(LookContext).look

function initialLook(): Look {
  const fromUrl = new URLSearchParams(window.location.search).get('look')
  if (fromUrl === 'sound' || fromUrl === 'concept') return fromUrl
  try {
    return window.localStorage.getItem(KEY) === 'sound' ? 'sound' : 'concept'
  } catch {
    return 'concept'
  }
}

export function LookProvider({ children }: { children: ReactNode }) {
  const [look, setLook] = useState<Look>(initialLook)
  useWindowSync('look', look, setLook)
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, look)
    } catch {
      /* storage can be blocked; the toggle still works for this visit */
    }
  }, [look])
  return <LookContext.Provider value={{ look, setLook }}>{children}</LookContext.Provider>
}

const OPTIONS: { id: Look; label: string }[] = [
  { id: 'concept', label: 'Concept' },
  { id: 'sound', label: 'Sound app' },
]

export function LookToggle() {
  const { look, setLook } = useContext(LookContext)
  return (
    <div
      className="flex items-center gap-1 rounded-xl bg-white p-1 text-xs ring-1 ring-line"
      role="radiogroup"
      aria-label="Phone look"
    >
      <Smartphone size={14} className="ml-1.5 text-ink-3" aria-hidden />
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={look === o.id}
          onClick={() => setLook(o.id)}
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition ${look === o.id ? 'bg-ink text-white' : 'text-ink-2 hover:bg-slate-100'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

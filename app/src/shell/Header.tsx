import { Database } from 'lucide-react'
import { events, memberKeys } from '../data/kit'
import { LookToggle } from '../ui/look'
import { toneDot, type Tone } from '../ui/primitives'

export type Tab = { id: string; label: string; sublabel: string; tone: Tone }

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#0b1220" />
        <circle cx="13" cy="16" r="6" fill="none" stroke="#5eead4" strokeWidth="2.5" />
        <circle cx="20" cy="16" r="6" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
      </svg>
      <div className="leading-none">
        <div className="font-display text-[26px] tracking-tight">Second Look</div>
        <p className="mt-1 text-[11px] leading-[13px] font-medium text-ink-2">One true fact, to the right person.</p>
      </div>
    </div>
  )
}

type HeaderProps = { tabs: Tab[]; active: string; onSelect: (id: string) => void }

export function Header({ tabs, active, onSelect }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1680px] flex-wrap items-center gap-x-4 gap-y-3 px-6 py-3.5 lg:px-8 2xl:gap-x-6">
        <Logo />
        <nav className="mx-auto flex rounded-2xl bg-slate-100/80 p-1 ring-1 ring-line" aria-label="Stories">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              aria-current={t.id === active}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition 2xl:px-4 ${t.id === active ? 'bg-white shadow-sm ring-1 ring-line' : 'hover:bg-white/60'}`}
            >
              <span className={`size-2 rounded-full ${toneDot[t.tone]}`} />
              <span className="leading-tight">
                <span className="block text-sm font-semibold">{t.label}</span>
                <span className="hidden text-[11px] text-ink-3 min-[1720px]:block">{t.sublabel}</span>
              </span>
            </button>
          ))}
        </nav>
        <LookToggle />
        <div
          className="hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-ink-2 ring-1 ring-line lg:flex"
          title="Triggers run live in the browser on the organizers' CSV files"
        >
          <Database size={14} className="text-brand" />
          <span>
            <b className="num">{events.length.toLocaleString()}</b> kit events ·{' '}
            <b className="num">{memberKeys.length}</b> members
          </span>
        </div>
      </div>
    </header>
  )
}

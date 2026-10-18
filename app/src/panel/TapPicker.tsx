import { Check } from 'lucide-react'
import { PANEL_TAPS } from './classify'
import { PANEL_GROUPS, type PanelGroup } from './results'

export const GROUP_NAMES: Record<PanelGroup, string> = {
  grandparent: 'Grandparent scam',
  government: 'Government scam',
  romance: 'Relationship investment scam',
}

type Props = {
  chosen: readonly string[]
  /** Skipper's suggestions: highlighted, never chosen for her. */
  heard: readonly string[]
  onToggle: (id: string) => void
}

/** Every story's warning taps, by scam, for when Skipper heard nothing or heard it wrong. */
export function TapPicker({ chosen, heard, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {PANEL_GROUPS.map((group) => (
        <fieldset key={group} className="flex flex-col gap-2">
          <legend className="mb-2 text-xs font-semibold tracking-wide text-ink-3 uppercase">
            {GROUP_NAMES[group]}
          </legend>
          {PANEL_TAPS.filter((t) => t.group === group).map((t) => {
            const on = chosen.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(t.id)}
                className={`flex min-h-11 w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-[15px] leading-tight font-semibold transition active:scale-[0.99] ${on ? 'bg-brand text-white ring-2 ring-brand' : `bg-white text-ink ring-1 ${heard.includes(t.id) ? 'ring-2 ring-indigo-300' : 'ring-slate-300'}`}`}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full ${on ? 'bg-white text-brand' : 'bg-slate-100'}`}
                  aria-hidden
                >
                  {on && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">{t.label}</span>
                {heard.includes(t.id) && !on && (
                  <span className="shrink-0 text-[11px] font-semibold text-brand">Skipper heard</span>
                )}
              </button>
            )
          })}
        </fieldset>
      ))}
    </div>
  )
}

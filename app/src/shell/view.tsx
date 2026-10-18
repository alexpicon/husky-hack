import { Columns2, Smartphone, UserRound } from 'lucide-react'

/**
 * What this device shows: both panes, one of them at full size, or the phone remote.
 * The panel pages stand alone: a judge's phone, the wall, and the voice drill.
 */
export type View = 'both' | 'member' | 'staff' | 'remote' | PanelView
export type PanelView = 'panel' | 'wall' | 'drill'
export type DemoView = Exclude<View, PanelView>

const VIEWS: readonly View[] = ['both', 'member', 'staff', 'remote', 'panel', 'wall', 'drill']

export const isPanelView = (v: View): v is PanelView => v === 'panel' || v === 'wall' || v === 'drill'

export function initialView(): View {
  const v = new URLSearchParams(window.location.search).get('view')
  return VIEWS.find((x) => x === v) ?? 'both'
}

export function writeViewToUrl(view: View) {
  const url = new URL(window.location.href)
  if (view === 'both') url.searchParams.delete('view')
  else url.searchParams.set('view', view)
  window.history.replaceState(null, '', url)
}

const OPTIONS: { id: Exclude<DemoView, 'remote'>; label: string; Icon: typeof Columns2 }[] = [
  { id: 'both', label: 'Both', Icon: Columns2 },
  { id: 'member', label: 'Member', Icon: Smartphone },
  { id: 'staff', label: 'Staff', Icon: UserRound },
]

export function ViewToggle({ view, onChange }: { view: DemoView; onChange: (v: DemoView) => void }) {
  return (
    <div className="flex rounded-xl bg-white p-1 text-xs ring-1 ring-line" role="radiogroup" aria-label="Screen">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={view === id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition ${view === id ? 'bg-ink text-white' : 'text-ink-2 hover:bg-slate-100'}`}
        >
          <Icon size={13} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  )
}

import type { KitEvent } from '../data/kit'
import { clock, day } from '../ui/format'
import { Source, toneDot } from '../ui/primitives'
import { details, type Hit } from './memberReplay'

/** The member's events in time order, each marked with the rules that fired on it. */
export function ReplayTimeline({ events, hits }: { events: KitEvent[]; hits: Hit[] }) {
  return (
    <ol
      className="mt-3 max-h-[420px] divide-y divide-line overflow-y-auto rounded-2xl ring-1 ring-line"
      aria-label="The member's events in time order"
    >
      {events.map((e) => {
        const fired = hits.filter((h) => h.event.id === e.id)
        return (
          <li
            key={e.id}
            className={`grid grid-cols-[96px_1fr_auto] gap-3 px-3 py-1.5 text-xs ${fired.length ? 'bg-slate-50' : ''}`}
          >
            <span className="num font-mono text-ink-3">
              {day(e.at)}
              <span className="block">{clock(e.at)}</span>
            </span>
            <span className="min-w-0">
              <b className="font-semibold text-ink">{e.type}</b>
              <span className="text-ink-3"> · {e.channel}</span>
              {details(e).length > 0 && (
                <span className="num block font-mono text-[11px] text-ink-2">{details(e).join(' · ')}</span>
              )}
            </span>
            <span className="flex flex-col items-end gap-1">
              <Source ids={e.id} />
              {fired.map((h) => (
                <span key={h.rule.key} className="flex items-center gap-1 font-semibold text-ink-2">
                  <span className={`size-2 rounded-full ${toneDot[h.rule.tone]}`} aria-hidden />
                  {h.rule.label}
                </span>
              ))}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

import { BadgeCheck, OctagonPause, Smartphone } from 'lucide-react'
import { tierName, tierReasons, type TakeoverFacts } from './takeoverFacts'

/** Which takeover tier fired on this payment, and why. */
export function TakeoverTier({ f }: { f: TakeoverFacts }) {
  const stop = f.fullStop
  return (
    <div
      className={`mb-3 rounded-xl px-3 py-2.5 ring-1 ring-inset ${stop ? 'bg-danger-soft/70 ring-rose-200' : 'bg-warn-soft/70 ring-amber-200'}`}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase ${stop ? 'bg-danger' : 'bg-warn'}`}
      >
        {stop ? <OctagonPause size={12} aria-hidden /> : <Smartphone size={12} aria-hidden />}
        {tierName(f)}
      </span>
      <ul className="mt-1.5 space-y-0.5">
        {tierReasons(f).map((reason) => (
          <li key={reason} className="text-sm font-semibold text-ink">
            {reason}
          </li>
        ))}
      </ul>
      {f.changeConfirmed && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-safe">
          <BadgeCheck size={13} aria-hidden />
          Contact change confirmed on the prior number
        </div>
      )}
    </div>
  )
}

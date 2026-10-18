import type { ReactNode } from 'react'
import { Building2, Smartphone, UserX, type LucideIcon } from 'lucide-react'
import type { Zone, ZoneTone } from '../story/engine'
import { Phone } from '../ui/devices'

/** Each zone has its own icon and words as well as its color, so color never carries it alone. */
const TONE: Record<ZoneTone, { frame: string; ink: string; Icon: LucideIcon }> = {
  attacker: { frame: 'bg-rose-50/80 ring-rose-300', ink: 'text-rose-800', Icon: UserX },
  member: { frame: 'bg-teal-50/80 ring-teal-300', ink: 'text-teal-800', Icon: Smartphone },
  staff: { frame: 'bg-indigo-50/70 ring-indigo-200', ink: 'text-indigo-800', Icon: Building2 },
}

/** A colored frame with a large label that says whose screen this is and who sees it. */
export function ZoneFrame({ zone, children }: { zone: Zone; children: ReactNode }) {
  const { frame, ink, Icon } = TONE[zone.tone]
  return (
    <section
      aria-label={zone.label}
      data-zone={zone.tone}
      className={`flex min-w-0 flex-col gap-4 rounded-[2rem] p-4 ring-2 ring-inset ${frame}`}
    >
      <header className="px-1.5 pt-0.5">
        <h2
          data-zone-label
          className={`flex items-center gap-2.5 text-[26px] leading-tight font-semibold tracking-tight ${ink}`}
        >
          <Icon size={26} strokeWidth={2.2} className="shrink-0" aria-hidden />
          {zone.label}
        </h2>
        {zone.who && (
          <p className="mt-1 text-[14px] leading-snug text-ink-2">
            <span className="font-semibold text-ink">Who sees this:</span> {zone.who}
          </p>
        )}
      </header>
      <div className={`flex min-w-0 flex-col ${zone.tone === 'staff' ? '' : 'items-center'}`}>
        {children}
      </div>
    </section>
  )
}

/** A dimmed phone with one line, so a zone with nothing new keeps its size and place. */
export function IdleDevice({ time, line, icon: Icon }: { time: string; line: string; icon: LucideIcon }) {
  return (
    <div className="opacity-75 saturate-50">
      <Phone time={time}>
        <div className="flex h-full flex-col items-center justify-center gap-5 bg-slate-100 px-10 text-center">
          <span className="grid size-16 place-items-center rounded-3xl bg-white text-ink-3 ring-1 ring-line">
            <Icon size={30} aria-hidden />
          </span>
          <p className="text-[21px] leading-snug font-semibold text-ink-2">{line}</p>
        </div>
      </Phone>
    </div>
  )
}

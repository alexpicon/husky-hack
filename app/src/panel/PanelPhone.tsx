import { AudioLines, Lock } from 'lucide-react'
import { SoundMark } from '../ui/brand'
import { Badge } from '../ui/primitives'
import { SKIPPER_MODE } from './classify'
import { CONCEPT, PHONE_ASK, PHONE_TITLE, PRIVACY, PRIVATE_PAGE } from './copy'
import { SkipperEntry } from './SkipperEntry'
import { panelLink } from './wallClient'

/** A judge's own phone: one column, no presenter controls, nothing shared but the result. */
export function PanelPhone({ code }: { code: string | null }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pt-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SoundMark size={24} round />
          <span className="font-display text-xl">Second Look</span>
        </div>
        <Badge tone="brand">{CONCEPT}</Badge>
      </div>

      <div>
        <h1 className="font-display text-[34px] leading-tight">{PHONE_TITLE}</h1>
        <p className="mt-1 text-[17px] text-ink-2">{PHONE_ASK}</p>
      </div>

      {!code && (
        <p className="rounded-2xl bg-warn-soft px-3.5 py-2.5 text-sm text-ink ring-1 ring-amber-200">
          This link has no wall code, so your result stays on this phone. Scan the code on the big screen to join
          the wall.
        </p>
      )}

      <SkipperEntry
        code={code}
        after={
          <a
            href={panelLink('drill')}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-base font-semibold text-white shadow-sm"
          >
            <AudioLines size={18} aria-hidden /> Try the drill: Real or AI?
          </a>
        }
      />

      <div className="mt-auto flex gap-2 rounded-2xl bg-white/70 px-3.5 py-3 text-xs leading-snug text-ink-3 ring-1 ring-line">
        <Lock size={14} className="mt-0.5 shrink-0" aria-hidden />
        <p>
          {PRIVACY[SKIPPER_MODE]} {PRIVATE_PAGE}
        </p>
      </div>
    </main>
  )
}

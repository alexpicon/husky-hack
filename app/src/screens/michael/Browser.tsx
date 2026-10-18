import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { SoundMark } from '../../ui/brand'
import type { Look } from '../../ui/look'
import { SOUND, soundFont } from '../../ui/soundApp'

/** Michael's computer: in the kit he sent his wires from Sound online banking, not the app. */
export function Browser({ look, caption, children }: { look: Look; caption?: string; children: ReactNode }) {
  const sound = look === 'sound'
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="rounded-[1.4rem] bg-slate-900 p-3 shadow-device ring-1 ring-slate-700">
        <div className="relative flex h-[470px] w-[640px] flex-col overflow-hidden rounded-xl bg-white">
          <div className="flex h-9 shrink-0 items-center gap-3 border-b border-line bg-slate-100 px-3">
            <span className="flex gap-1.5" aria-hidden>
              <i className="size-2.5 rounded-full bg-rose-300" />
              <i className="size-2.5 rounded-full bg-amber-300" />
              <i className="size-2.5 rounded-full bg-teal-300" />
            </span>
            <span className="flex h-6 flex-1 items-center gap-1.5 rounded-md bg-white px-2.5 text-[12px] text-ink-3 ring-1 ring-line">
              <Lock size={11} aria-hidden /> Sound online banking
            </span>
          </div>
          <header
            className={`flex h-12 shrink-0 items-center gap-2.5 px-5 ${sound ? 'text-white' : 'border-b border-line text-ink'}`}
            style={sound ? { ...soundFont, background: `linear-gradient(180deg, ${SOUND.navy}, ${SOUND.navyLight})` } : undefined}
          >
            {!sound && <SoundMark size={22} />}
            <span className="text-[16px] font-semibold">{sound ? 'Sound Online Banking' : 'Online banking'}</span>
            <span className={`ml-auto text-[13px] ${sound ? 'text-white/80' : 'text-ink-3'}`}>Wires</span>
          </header>
          <div
            className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
            style={sound ? { ...soundFont, background: SOUND.canvas, color: SOUND.text } : undefined}
          >
            {children}
          </div>
        </div>
      </div>
      {caption && <figcaption className="text-xs font-medium text-ink-3">{caption}</figcaption>}
    </figure>
  )
}

import type { ReactNode } from 'react'
import { BatteryFull, ShieldCheck, Signal, Wifi } from 'lucide-react'

type PhoneProps = {
  time: string
  caption?: string
  dark?: boolean
  /** 'navy' matches a Sound app screen's title bar. */
  statusBar?: 'navy'
  children: ReactNode
}

/** Screens get a 340 x 652 area under the status bar and scroll inside it. */
export function Phone({ time, caption, dark = false, statusBar, children }: PhoneProps) {
  const bar = statusBar === 'navy' ? 'bg-[#0b1f5c] text-white' : dark ? 'text-white' : 'text-ink'
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative rounded-[3.2rem] bg-slate-900 p-3 shadow-device ring-1 ring-slate-700">
        <div
          className={`relative h-[700px] w-[340px] overflow-hidden rounded-[2.5rem] ${dark ? 'bg-slate-950 text-white' : 'bg-white text-ink'}`}
        >
          <div className="absolute top-2.5 left-1/2 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
          <div
            className={`relative z-10 flex h-12 items-end justify-between px-7 pb-1 text-[13px] font-semibold ${bar}`}
          >
            <span className="num">{time}</span>
            <span className="flex items-center gap-1">
              <Signal size={14} />
              <Wifi size={14} />
              <BatteryFull size={16} />
            </span>
          </div>
          <div className="h-[652px] overflow-y-auto">{children}</div>
        </div>
      </div>
      {caption && <figcaption className="text-xs font-medium text-ink-3">{caption}</figcaption>}
    </figure>
  )
}

export function Tablet({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="rounded-[2.2rem] bg-slate-900 p-4 shadow-device ring-1 ring-slate-700">
        <div className="h-[460px] w-[640px] overflow-y-auto rounded-[1.4rem] bg-white">
          {children}
        </div>
      </div>
      {caption && <figcaption className="text-xs font-medium text-ink-3">{caption}</figcaption>}
    </figure>
  )
}

export function StaffWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-device ring-1 ring-line">
      <div className="flex items-center gap-3 border-b border-line bg-slate-50/80 px-5 py-3">
        <span className="flex gap-1.5">
          <i className="size-3 rounded-full bg-rose-300" />
          <i className="size-3 rounded-full bg-amber-300" />
          <i className="size-3 rounded-full bg-teal-300" />
        </span>
        <span className="flex items-center gap-2 text-sm font-semibold text-ink-2">
          <ShieldCheck size={16} className="text-brand" />
          Sound Member Protection
        </span>
        <span className="ml-auto text-xs font-medium text-ink-3">{title}</span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

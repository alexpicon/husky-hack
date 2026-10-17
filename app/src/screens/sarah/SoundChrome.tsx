import type { ReactNode } from 'react'
import { AudioLines, ChevronLeft } from 'lucide-react'
import { motion } from 'motion/react'

export function SoundMark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const box = size === 'lg' ? 'size-11 rounded-2xl' : 'size-7 rounded-[10px]'
  return (
    <span
      className={`grid shrink-0 place-items-center bg-linear-to-br from-indigo-500 via-brand to-indigo-900 text-white shadow-sm ${box}`}
      aria-hidden
    >
      <AudioLines size={size === 'lg' ? 22 : 15} strokeWidth={2.4} />
    </span>
  )
}

export function SoundWordmark() {
  return (
    <span className="flex items-center gap-2">
      <SoundMark />
      <span className="leading-none">
        <span className="block text-[17px] font-bold tracking-tight text-ink">Sound</span>
        <span className="block text-[9px] font-semibold tracking-[0.18em] text-ink-3 uppercase">
          Credit Union
        </span>
      </span>
    </span>
  )
}

/** Top bar of the Sound banking app or website on a phone. */
export function SoundBar({ channel, right }: { channel?: string; right?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line/70 bg-white/90 px-5 py-3 backdrop-blur">
      <SoundWordmark />
      {right ??
        (channel && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-ink-2">
            {channel}
          </span>
        ))}
    </div>
  )
}

export function ScreenTitle({ children, back = true }: { children: ReactNode; back?: boolean }) {
  return (
    <div className="flex items-center gap-1 px-4 pt-4">
      {back && <ChevronLeft size={24} className="text-ink-3" aria-hidden />}
      <h2 className={`text-[22px] font-bold tracking-tight ${back ? '' : 'pl-1'}`}>{children}</h2>
    </div>
  )
}

/** Header of a text thread from Sound in the phone's Messages app. */
export function ThreadHeader({ when }: { when: string }) {
  return (
    <div className="sticky top-0 z-10 flex flex-col items-center gap-1 border-b border-line/70 bg-slate-50/95 pt-1 pb-3 backdrop-blur">
      <ChevronLeft size={24} className="absolute top-3 left-3 text-brand" aria-hidden />
      <SoundMark size="lg" />
      <span className="text-[13px] font-semibold text-ink">Sound</span>
      <span className="text-[11px] text-ink-3">Text message · {when}</span>
    </div>
  )
}

export function Bubble({
  from = 'sound',
  delay = 0,
  instant = false,
  children,
}: {
  from?: 'sound' | 'me'
  delay?: number
  instant?: boolean
  children: ReactNode
}) {
  const mine = from === 'me'
  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
      className={`max-w-[85%] rounded-[22px] px-4 py-2.5 text-[16px] leading-snug ${mine ? 'self-end rounded-br-md bg-brand text-white' : 'self-start rounded-bl-md bg-slate-100 text-ink'}`}
    >
      {children}
    </motion.div>
  )
}

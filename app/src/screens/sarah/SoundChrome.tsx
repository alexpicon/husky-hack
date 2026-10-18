import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'motion/react'
import { ReportLink } from '../../report/ReportLink'
import { useReportLink } from '../../report/useReportSheet'
import { SoundMark as BrandMark, SoundLogo } from '../../ui/brand'
import { useLook } from '../../ui/look'

export function SoundMark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return <BrandMark size={size === 'lg' ? 44 : 28} />
}

export function SoundWordmark() {
  return <SoundLogo height={17} />
}

/** Top bar of the Sound banking app or website on a phone, with the report link where POLICY shows it. */
export function SoundBar({ channel, right }: { channel?: string; right?: ReactNode }) {
  const link = useReportLink()
  return (
    <>
      <div className="sticky top-0 z-10 border-b border-line/70 bg-white/90 px-5 backdrop-blur">
        <div className={`flex items-center justify-between ${link.shown ? 'pt-2.5 pb-2' : 'py-3'}`}>
          <SoundWordmark />
          {right ??
            (channel && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-ink-2">
                {channel}
              </span>
            ))}
        </div>
        {link.shown && (
          <div className="flex justify-center pb-2">
            <ReportLink onOpen={link.open} />
          </div>
        )}
      </div>
      {link.sheet}
    </>
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
  const sender = useLook() === 'sound' ? 'Sound Credit Union' : 'Sound'
  return (
    <div className="sticky top-0 z-10 flex flex-col items-center gap-1 border-b border-line/70 bg-slate-50/95 pt-1 pb-3 backdrop-blur">
      <ChevronLeft size={24} className="absolute top-3 left-3 text-brand" aria-hidden />
      <SoundMark size="lg" />
      <span className="text-[13px] font-semibold text-ink">{sender}</span>
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
